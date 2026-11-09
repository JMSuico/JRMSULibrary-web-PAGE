/**
 * GLOBAL CALLING IMPORTS: Shared
 * Universal reusable UI primitives and presentation components.
 * 
 * Usage:
 * import {
 *   Button,
 *   Checkbox,
 *   RadioButton,
 *   Dropdown,
 *   SearchBar,
 *   DefaultFloatingModalCard,
 *   ModalCard,
 *   Drawer,
 *   Pagination,
 *   SkeletonLine,
 *   SkeletonCard,
 *   ImageGallery,
 *   TreeView,
 *   LinearCurveyChart,
 *   BarGraphChart,
 * } from '@/Shared';
 */

// Atomic Primitives
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './Button';
export { Checkbox, type CheckboxProps } from './Checkbox';
export { RadioButton, type RadioButtonProps } from './RadioButton';
export { Dropdown, type DropdownProps, type DropdownOption } from './Dropdown';
export { SearchBar, type SearchBarProps } from './SearchBar';

// Modals, Cards & Drawers
export {
  DefaultFloatingModalCard,
  type DefaultFloatingModalCardProps,
  type ModalSize,
} from './DefaultFloatingModalCard';
export { ModalCard, type ModalCardProps } from './ModalCard';
export { Drawer, type DrawerProps, type DrawerPosition } from './Drawer';

// Feedback & Loading
export {
  SkeletonLine,
  SkeletonCircle,
  SkeletonCard,
  SkeletonImage,
  PageSkeleton,
} from './SkeletonLoader';

// Navigation & Pagination
export { Pagination } from './Pagination';

// Complex Presentationals
export { DragDropFileUpload } from './DragDropFileUpload';
export { ImageGallery } from './ImageGallery';
export { TreeView } from './TreeView';

// Charts Suite
export {
  LinearCurveyChart,
  type LinearCurveyChartProps,
  type LinearCurveyDataPoint,
} from './Charts/LinearCurveyChart';
export {
  BarGraphChart,
  type BarGraphChartProps,
  type BarGraphDataPoint,
} from './Charts/BarGraphChart';
export {
  PieGraphChart,
  type PieGraphChartProps,
  type PieGraphDataPoint,
} from './Charts/PieGraphChart';
export {
  HeatmapChart,
  type HeatmapChartProps,
  type HeatmapCell,
} from './Charts/HeatmapChart';
