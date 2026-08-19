export interface AppTNCSectionFields {
    number: number;
    heading: string;
    content: string;
}

export interface AppTNCDocumentFields {
    type: string;
    title: string;
    introduction: string;
    version: string; // Formatted date (e.g., "2024-01-15")
    sections: AppTNCSectionFields[];
}

export interface AppTNCFields {
    schema_: string;
    documents: AppTNCDocumentFields[];
}
