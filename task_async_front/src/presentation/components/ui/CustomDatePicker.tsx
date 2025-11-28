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
  onConfirm,
  onCancel,
}: CustomDatePickerProps) => {
  const handleConfirm = (selectedDate: Date) => {
    const exactDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedDate.getHours(),
      selectedDate.getMinutes(),
      selectedDate.getSeconds()
    );
    onConfirm(exactDate);
  };

  return (
    <DateTimePickerModal
      isVisible={visible}
      mode="datetime"
      date={date}
      minimumDate={minimumDate}
      locale="es_ES"
      confirmTextIOS="Confirmar"
      cancelTextIOS="Cancelar"
      buttonTextColorIOS={colors.primary}
      onConfirm={handleConfirm}
      onCancel={onCancel}
    />
  );
};