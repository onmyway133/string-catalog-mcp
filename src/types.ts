/**
 * Types for Xcode String Catalog (.xcstrings) file format
 */

/** State of a localization string */
export type LocalizationState = 'new' | 'translated' | 'needs_review' | 'stale';

/** A single string unit containing the translation value and state */
export interface StringUnit {
    state: LocalizationState;
    value: string;
}

/** Localization entry for a single language */
export interface LocalizationEntry {
    stringUnit?: StringUnit;
    /** For plural variations */
    variations?: {
        plural?: {
            zero?: { stringUnit: StringUnit };
            one?: { stringUnit: StringUnit };
            two?: { stringUnit: StringUnit };
            few?: { stringUnit: StringUnit };
            many?: { stringUnit: StringUnit };
            other?: { stringUnit: StringUnit };
        };
        device?: Record<string, { stringUnit: StringUnit }>;
    };
}

/** All localizations for a single string key */
export interface StringLocalizations {
    [languageCode: string]: LocalizationEntry;
}

/** A single string entry in the catalog */
export interface StringEntry {
    comment?: string;
    extractionState?: 'manual' | 'extracted_with_value' | 'stale';
    localizations?: StringLocalizations;
}

/** Root structure of an .xcstrings file */
export interface XCStrings {
    sourceLanguage: string;
    version?: string;
    strings: {
        [key: string]: StringEntry;
    };
}

/**
 * Translation input format for the update tool
 */
export interface TranslationInput {
    key: string;
    translations: {
        language: string;
        value: string;
        state?: LocalizationState;
    }[];
    comment?: string;
}

export interface TranslationData {
    data: TranslationInput[];
}

/**
 * Output format for listing translations of a key
 */
export interface KeyTranslation {
    language: string;
    value: string;
    state: LocalizationState;
}

export interface KeyTranslationsResult {
    key: string;
    sourceLanguage: string;
    translations: KeyTranslation[];
}
