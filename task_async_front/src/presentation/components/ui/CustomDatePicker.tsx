import React from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { colors } from '../../theme/colors';

type CustomDatePickerProps = {
  visible: boolean;
  date: Date;
  minimumDate?: Date;
  title?: string; 
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
      confirmTextIOS="Confirmar"
      cancelTextIOS="Cancelar"
      buttonTextColorIOS={colors.primary} 
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};