import { useState } from 'react';
import { Pressable, TextInputProps } from 'react-native';
import { Field } from '../ui/Field';
import { Icon } from '../ui/Icon';
import { colors } from '../../theme';
export function PasswordField({ label, ...props }: TextInputProps & { label: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <Field
      {...props}
      label={label}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      rightAccessory={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
          accessibilityState={{ disabled: props.editable === false }}
          disabled={props.editable === false}
          onPress={() => setVisible((v) => !v)}
          style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name={visible ? 'eye-off' : 'eye'} size={19} color={colors.muted} />
        </Pressable>
      }
    />
  );
}
