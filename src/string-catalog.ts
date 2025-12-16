import * as fs from 'fs';
import * as path from 'path';
import {
    XCStrings,
    StringEntry,
    TranslationInput,
    KeyTranslationsResult,
    KeyTranslation,
    LocalizationState,
} from './types';

/**
 * StringCatalog class for reading and manipulating .xcstrings files
 */
export class StringCatalog {
    private filePath: string;
    private data: XCStrings;

    constructor(filePath: string) {
        this.filePath = path.resolve(filePath);
        this.data = this.load();
    }

    private load(): XCStrings {
        if (!fs.existsSync(this.filePath)) {
            throw new Error(`String catalog file not found: ${this.filePath}`);
        }

        const content = fs.readFileSync(this.filePath, 'utf-8');
        return JSON.parse(content) as XCStrings;
    }

    /**
     * Get the source language of the catalog
     */
    getSourceLanguage(): string {
        return this.data.sourceLanguage;
    }

    /**
     * Get all supported languages in the catalog
     */
    getSupportedLanguages(): string[] {
        const languages = new Set<string>();
        languages.add(this.data.sourceLanguage);

        for (const key in this.data.strings) {
            const entry = this.data.strings[key];
            if (entry.localizations) {
                for (const lang of Object.keys(entry.localizations)) {
                    languages.add(lang);
                }
            }
        }

        return Array.from(languages).sort();
    }

    /**
     * Get all keys in the catalog
     */
    getAllKeys(): string[] {
        return Object.keys(this.data.strings).sort();
    }

    /**
     * Get translations for a specific key
     */
    getTranslationsForKey(key: string): KeyTranslationsResult | null {
        const entry = this.data.strings[key];
        if (!entry) {
            return null;
        }

        const translations: KeyTranslation[] = [];

        if (entry.localizations) {
            for (const [language, localization] of Object.entries(entry.localizations)) {
                if (localization.stringUnit) {
                    translations.push({
                        language,
                        value: localization.stringUnit.value,
                        state: localization.stringUnit.state,
                    });
                } else if (localization.variations?.plural) {
                    // For plural strings, show the "other" form as the primary value
                    const plural = localization.variations.plural;
                    const primaryForm = plural.other || plural.one || plural.zero;
                    if (primaryForm) {
                        translations.push({
                            language,
                            value: `[plural] ${primaryForm.stringUnit.value}`,
                            state: primaryForm.stringUnit.state,
                        });
                    }
                }
            }
        }

        return {
            key,
            sourceLanguage: this.data.sourceLanguage,
            translations: translations.sort((a, b) => a.language.localeCompare(b.language)),
        };
    }

    /**
     * Search for keys containing a specific substring
     */
    searchKeys(query: string): string[] {
        const lowerQuery = query.toLowerCase();
        return this.getAllKeys().filter((key) => key.toLowerCase().includes(lowerQuery));
    }

    /**
     * Update translations for one or more keys
     */
    updateTranslations(translations: TranslationInput[]): { updated: string[]; created: string[] } {
        const updated: string[] = [];
        const created: string[] = [];

        for (const translation of translations) {
            const { key, translations: langTranslations, comment } = translation;

            const isNew = !this.data.strings[key];

            if (isNew) {
                this.data.strings[key] = {};
                created.push(key);
            } else {
                updated.push(key);
            }

            const entry = this.data.strings[key];

            if (comment) {
                entry.comment = comment;
            }

            if (!entry.localizations) {
                entry.localizations = {};
            }

            for (const langTrans of langTranslations) {
                entry.localizations[langTrans.language] = {
                    stringUnit: {
                        state: langTrans.state || 'translated',
                        value: langTrans.value,
                    },
                };
            }
        }

        return { updated, created };
    }

    /**
     * Save changes to the file
     */
    save(): void {
        // Sort keys alphabetically for consistent output
        const sortedStrings: { [key: string]: StringEntry } = {};
        const keys = Object.keys(this.data.strings).sort();

        for (const key of keys) {
            sortedStrings[key] = this.data.strings[key];
        }

        const output: XCStrings = {
            sourceLanguage: this.data.sourceLanguage,
            strings: sortedStrings,
        };

        if (this.data.version) {
            output.version = this.data.version;
        }

        // Write with 2-space indentation to match Xcode format
        fs.writeFileSync(this.filePath, JSON.stringify(output, null, 2) + '\n', 'utf-8');
    }

    /**
     * Get statistics about the catalog
     */
    getStatistics(): {
        totalKeys: number;
        languages: string[];
        translationCoverage: Record<
            string,
            { translated: number; total: number; percentage: number }
        >;
    } {
        const languages = this.getSupportedLanguages();
        const allKeys = this.getAllKeys();
        const totalKeys = allKeys.length;

        const translationCoverage: Record<
            string,
            { translated: number; total: number; percentage: number }
        > = {};

        for (const lang of languages) {
            let translated = 0;

            for (const key of allKeys) {
                const entry = this.data.strings[key];
                const localization = entry.localizations?.[lang];

                if (localization?.stringUnit?.state === 'translated') {
                    translated++;
                } else if (localization?.variations?.plural) {
                    // Count plural as translated if it has an "other" form
                    if (localization.variations.plural.other?.stringUnit?.state === 'translated') {
                        translated++;
                    }
                }
            }

            translationCoverage[lang] = {
                translated,
                total: totalKeys,
                percentage: totalKeys > 0 ? Math.round((translated / totalKeys) * 100) : 0,
            };
        }

        return {
            totalKeys,
            languages,
            translationCoverage,
        };
    }
}
