import Feather from '@expo/vector-icons/Feather';
import { ComponentProps } from 'react';
import { colors } from '../../theme';
export type IconName = ComponentProps<typeof Feather>['name'];
export function Icon({
  name,
  size = 20,
  color = colors.ink,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return <Feather name={name} size={size} color={color} accessible={false} aria-hidden />;
}
