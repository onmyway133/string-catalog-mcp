import * as fs from 'fs';
import * as path from 'path';
import {
    XCStrings,
    StringEntry,
    TranslationInput,
    KeyTranslationsResult,
    KeyTranslation,
    LocalizationState,
    MissingTranslationResult,
    StaleKeyResult,
} from './types.js';

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

    getSourceLanguage(): string {
        return this.data.sourceLanguage;
    }

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

    getAllKeys(): string[] {
        return Object.keys(this.data.strings).sort();
    }

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

    searchKeys(query: string): string[] {
        const lowerQuery = query.toLowerCase();
        return this.getAllKeys().filter((key) => key.toLowerCase().includes(lowerQuery));
    }

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
                if (langTrans.pluralForms && Object.keys(langTrans.pluralForms).length > 0) {
                    const plural: Record<
                        string,
                        { stringUnit: { state: LocalizationState; value: string } }
                    > = {};
                    for (const [form, value] of Object.entries(langTrans.pluralForms)) {
                        if (value !== undefined) {
                            plural[form] = {
                                stringUnit: {
                                    state: langTrans.state || 'translated',
                                    value,
                                },
                            };
                        }
                    }
                    entry.localizations[langTrans.language] = {
                        variations: { plural },
                    };
                } else if (langTrans.value !== undefined) {
                    entry.localizations[langTrans.language] = {
                        stringUnit: {
                            state: langTrans.state || 'translated',
                            value: langTrans.value,
                        },
                    };
                }
            }
        }

        return { updated, created };
    }

    save(): void {
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

        fs.writeFileSync(this.filePath, JSON.stringify(output, null, 2) + '\n', 'utf-8');
    }

    getStatistics(): {
        totalKeys: number;
        languages: string[];
        translationCoverage: Record<string, { translated: number; total: number; percentage: number }>;
    } {
        const languages = this.getSupportedLanguages();
        const translatableKeys = this.getAllKeys().filter(
            (key) => this.data.strings[key].shouldTranslate !== false,
        );
        const totalKeys = translatableKeys.length;
        const translationCoverage: Record<
            string,
            { translated: number; total: number; percentage: number }
        > = {};

        for (const lang of languages) {
            let translated = 0;

            for (const key of translatableKeys) {
                const entry = this.data.strings[key];
                const localization = entry.localizations?.[lang];

                if (localization?.stringUnit?.state === 'translated') {
                    translated++;
                } else if (localization?.variations?.plural) {
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

        return { totalKeys, languages, translationCoverage };
    }

    getDetailedStatistics(): {
        totalKeys: number;
        translatableKeys: number;
        skippedKeys: number;
        languages: string[];
        translationCoverage: Record<
            string,
            {
                translated: number;
                needs_review: number;
                new: number;
                stale: number;
                total: number;
                percentage: number;
            }
        >;
    } {
        const languages = this.getSupportedLanguages();
        const allKeys = this.getAllKeys();
        const translatableKeys = allKeys.filter(
            (key) => this.data.strings[key].shouldTranslate !== false,
        );
        const skippedKeys = allKeys.length - translatableKeys.length;
        const translationCoverage: Record<
            string,
            {
                translated: number;
                needs_review: number;
                new: number;
                stale: number;
                total: number;
                percentage: number;
            }
        > = {};

        for (const lang of languages) {
            let translated = 0;
            let needs_review = 0;
            let newCount = 0;
            let stale = 0;

            for (const key of translatableKeys) {
                const entry = this.data.strings[key];
                const localization = entry.localizations?.[lang];

                const getState = (): LocalizationState | null => {
                    if (localization?.stringUnit) {
                        return localization.stringUnit.state;
                    }
                    if (localization?.variations?.plural) {
                        const other = localization.variations.plural.other;
                        return other?.stringUnit?.state ?? null;
                    }
                    return null;
                };

                const state = getState();
                if (state === 'translated') translated++;
                else if (state === 'needs_review') needs_review++;
                else if (state === 'new') newCount++;
                else if (state === 'stale') stale++;
            }

            const total = translatableKeys.length;
            translationCoverage[lang] = {
                translated,
                needs_review,
                new: newCount,
                stale,
                total,
                percentage: total > 0 ? Math.round((translated / total) * 100) : 0,
            };
        }

        return {
            totalKeys: allKeys.length,
            translatableKeys: translatableKeys.length,
            skippedKeys,
            languages,
            translationCoverage,
        };
    }

    getMissingTranslations(targetLanguage?: string): MissingTranslationResult[] {
        const languagesToCheck = targetLanguage
            ? [targetLanguage]
            : this.getSupportedLanguages();

        const results: MissingTranslationResult[] = [];

        for (const key of this.getAllKeys()) {
            const entry = this.data.strings[key];
            if (entry.shouldTranslate === false) {
                continue;
            }

            const missingLanguages: string[] = [];

            for (const lang of languagesToCheck) {
                const localization = entry.localizations?.[lang];

                if (!localization) {
                    missingLanguages.push(lang);
                    continue;
                }

                if (localization.stringUnit) {
                    if (!localization.stringUnit.value) {
                        missingLanguages.push(lang);
                    }
                } else if (localization.variations?.plural) {
                    const otherForm = localization.variations.plural.other;
                    if (!otherForm?.stringUnit?.value) {
                        missingLanguages.push(lang);
                    }
                } else {
                    missingLanguages.push(lang);
                }
            }

            if (missingLanguages.length > 0) {
                results.push({ key, missingLanguages });
            }
        }

        return results;
    }

    getStaleKeys(): StaleKeyResult[] {
        const results: StaleKeyResult[] = [];

        for (const key of this.getAllKeys()) {
            const entry = this.data.strings[key];

            if (entry.extractionState === 'stale') {
                results.push({ key, reason: 'extractionState' });
                continue;
            }

            if (entry.localizations) {
                for (const [lang, localization] of Object.entries(entry.localizations)) {
                    if (localization.stringUnit?.state === 'stale') {
                        results.push({ key, reason: 'stringUnitState', language: lang });
                    } else if (localization.variations?.plural?.other?.stringUnit?.state === 'stale') {
                        results.push({ key, reason: 'stringUnitState', language: lang });
                    }
                }
            }
        }

        return results;
    }
}
