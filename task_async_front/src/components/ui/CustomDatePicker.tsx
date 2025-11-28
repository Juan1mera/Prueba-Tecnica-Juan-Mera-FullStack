// src/components/ui/CustomDatePicker.tsx
import React from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { colors } from '../../theme/colors';

type CustomDatePickerProps = {
  visible: boolean;
  date: Date;
  minimumDate?: Date;
  title?: string; // opcional: para fecha límite o recordatorio
  onConfirm: (date: Date) => void;
  onCancel: () => void;
};

export const CustomDatePicker = ({
  visible,
  date,
  minimumDate,
  // title,
  onConfirm,
  onCancel,
}: CustomDatePickerProps) => {
  return (
    <DateTimePickerModal
      isVisible={visible}
      mode="datetime"
      date={date}
      minimumDate={minimumDate}
      locale="es_ES" // español
      // headerTextIOS={title || 'Elige fecha y hora'}
      confirmTextIOS="Confirmar"
      cancelTextIOS="Cancelar"
      buttonTextColorIOS={colors.primary} // tu color principal
      onConfirm={onConfirm}
      onCancel={onCancel}
      // En Android se ve nativo bonito, en iOS se ve como modal nativo
    />
  );
};