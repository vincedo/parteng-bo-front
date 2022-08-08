/**
 * @file
 * A fragment of a breadcrumb.
 *
 * Example: in "Home > Référentiel > Projets", we have 3 fragments.
 */

export type Breadcrumb = BreadcrumbFragment[];

export interface BreadcrumbFragment {
  // Translated label for the fragment
  label: string;
  // Optional path for the fragment
  // If undefined, the fragment is not clickable
  path?: string | any[];
  // Optional function to execute when fragment is clicked
  clickFn?: () => void;
}
