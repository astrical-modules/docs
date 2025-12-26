import { getSpecs } from '~/utils/loader';

/**
 * Interface for a Menu Item
 */
export interface MenuItem {
    text?: string;
    label?: string;
    href?: string;
    items?: MenuItem[];
    icon?: string;
    [key: string]: any;
}

/**
 * Interface for Pagination Links
 */
export interface Pagination {
    prev: MenuItem | null;
    next: MenuItem | null;
}

/**
 * Fetches a specific menu by ID from the appropriate content source.
 * Supports loading from module-specific or shared content.
 * 
 * @param id The ID/Reference of the menu to load (e.g. 'docs_sidebar')
 * @returns The menu object
 */
export const fetchMenu = async (id: string): Promise<MenuItem[]> => {
    try {
        // menus are typically loaded via getSpecs('menus')
        // The loader aggregates menus from content/menus and modules
        const menus = getSpecs('menus');

        const menu = menus[id];

        if (!menu) {
            console.warn(`Menu with ID '${id}' not found via getSpecs('menus'). Checking shared...`);
            // Fallback: Check 'shared' if it's defined as a shared component and not a top-level menu
            // Sometimes menus are defined in shared/menus/*.yaml
            const shared = getSpecs('shared');
            if (shared[id]) return shared[id] as MenuItem[];

            return [];
        }

        // Spec format usually has an 'items' array or is the array itself depending on schema
        // Assuming standard format where menu root might be the object or have properties
        if (Array.isArray(menu)) return menu;
        // If it's an object with 'items', return items.
        if ('items' in (menu as any)) return (menu as any).items;

        return [];
    } catch (error) {
        console.error(`Error fetching menu '${id}':`, error);
        return [];
    }
};

/**
 * Calculates Previous and Next pagination links based on the current path and menu.
 * 
 * @param menuData The full menu tree
 * @param currentPath The current page path
 * @returns Pagination object with prev/next items
 */
export const getPagination = (menuData: MenuItem[], currentPath: string): Pagination => {
    // Normalize path (remove trailing slash for comparison if needed, but Astro.url.pathname usually has it)
    // Let's rely on exact match or handling trailing slashes if needed.
    const normalize = (p: string) => p?.replace(/\/$/, '') || '';
    const target = normalize(currentPath);

    // Flatten the tree
    const flatList: MenuItem[] = [];

    function traverse(items: MenuItem[]) {
        if (!items) return;
        for (const item of items) {
            if (item.href) {
                flatList.push(item);
            }
            if (item.items) {
                traverse(item.items);
            }
        }
    }

    traverse(menuData);

    const currentIndex = flatList.findIndex(item => normalize(item.href || '') === target);

    if (currentIndex === -1) {
        return { prev: null, next: null };
    }

    return {
        prev: currentIndex > 0 ? flatList[currentIndex - 1] : null,
        next: currentIndex < flatList.length - 1 ? flatList[currentIndex + 1] : null
    };
};

/**
 * Generates breadcrumb path for the current page.
 * 
 * @param menuData The full menu tree
 * @param currentPath The current page path
 * @returns Array of menu items representing the path (Root -> Category -> Page)
 */
export const getBreadcrumbs = (menuData: MenuItem[], currentPath: string): MenuItem[] => {
    const normalize = (p: string) => p?.replace(/\/$/, '') || '';
    const target = normalize(currentPath);
    const path: MenuItem[] = [];

    function findPath(items: MenuItem[], currentStack: MenuItem[]): boolean {
        for (const item of items) {
            const newStack = [...currentStack, item];
            // Match found?
            if (item.href && normalize(item.href) === target) {
                path.push(...newStack); // Found it!
                return true;
            }
            // Check children
            if (item.items) {
                if (findPath(item.items, newStack)) return true;
            }
        }
        return false;
    }

    findPath(menuData, []);
    return path;
};
