import React from 'react';
import { DefaultFloatingModalCard, type DefaultFloatingModalCardProps } from './DefaultFloatingModalCard';

export interface ModalCardProps extends DefaultFloatingModalCardProps {}

/**
 * GLOBAL CALLING PRIMITIVE: ModalCard
 * Re-export / alias for universal modal dialog cards.
 */
export const ModalCard: React.FC<ModalCardProps> = (props) => {
  return <DefaultFloatingModalCard {...props} />;
};
