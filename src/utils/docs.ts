import type { Widget } from '~/types';

/**
 * Extended Widget interface for docs logic
 */
interface DocsWidget extends Widget {
    title?: string;
    name?: string;
    component?: string;
}

/**
 * Generates a URL-friendly slug from a string.
 * @param text The text to slugify
 * @returns The slugified string
 */
export const slugify = (text: string): string => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/&/g, '-and-')   // Replace & with 'and'
        .replace(/[^\w-]/g, '')   // Remove all non-word characters
        .replace(/--+/g, '-')     // Replace multiple - with single -
        .replace(/^-+/, '')       // Trim - from start of text
        .replace(/-+$/, '');      // Trim - from end of text
};

/**
 * Represents a Table of Contents item
 */
export interface TOCItem {
    id: string;
    label: string;
    type: string;
}

/**
 * Generates a Table of Contents from a list of widgets.
 * @param widgets The list of widgets to scan
 * @returns Array of TOC items
 */
export const generateTOC = (widgets: DocsWidget[] = []): TOCItem[] => {
    if (!Array.isArray(widgets)) return [];

    return widgets.flatMap((widget, index) => {
        // Only include widgets that have a title or name to link to
        const label = widget.title || widget.name;

        if (!label) return [];

        // Use widget's explicit ID if provided, otherwise generate one from label
        // If no label, fallback to type + index (though we filtered those out above, 
        // but good for uniqueness if we change logic)
        const id = widget.id || slugify(label) || `section-${index}`;

        return [{
            id,
            label,
            type: widget.component || 'section' // or widget.type if available
        }];
    });
};
