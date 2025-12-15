/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FormikHelpers, type FormikValues, useFormik } from 'formik';
import { withZodSchema } from 'formik-validator-zod';
import { useMemo, useState } from 'react';
import { type z } from 'zod';
import { type AlertProps } from '../components/Alert';
import { type ButtonProps } from '../components/Button';

export const useForm = <TValues extends FormikValues = any>({
  successMessage = false,
  resetOnSuccess = true,
  showValidationAlert = false,
  initialValues = {} as TValues,
  validationSchema,
  onSubmit,
}: {
  successMessage?: string | false;
  resetOnSuccess?: boolean;
  showValidationAlert?: boolean;
  initialValues?: TValues;
  validationSchema?: z.ZodTypeAny;
  onSubmit?: (values: TValues, actions: FormikHelpers<TValues>) => Promise<any> | any;
}) => {
  const [successMessageVisible, setSuccessMessageVisible] = useState(false);
  const [submittingError, setSubmittingError] = useState<Error | null>(null);

  const formik = useFormik<TValues>({
    initialValues,
    ...(validationSchema && { validate: withZodSchema(validationSchema) }),
    onSubmit: async (values, formikHelpers) => {
      if (!onSubmit) {
        return;
      }
      try {
        setSubmittingError(null);
        await onSubmit(values, formikHelpers);
        if (resetOnSuccess) {
          formik.resetForm();
        }
        setSuccessMessageVisible(true);
        setTimeout(() => {
          setSuccessMessageVisible(false);
        }, 3000);
      } catch (error: any) {
        setSubmittingError(error);
      }
    },
  });

  const alertProps = useMemo<AlertProps>(() => {
    if (submittingError) {
      return {
        hidden: false,
        children: submittingError.message,
        color: 'red',
      };
    }
    if (showValidationAlert && !formik.isValid && !!formik.submitCount) {
      return {
        hidden: false,
        children: 'Some fields are invalid',
        color: 'red',
      };
    }
    if (successMessageVisible && successMessage) {
      return {
        hidden: false,
        children: successMessage,
        color: 'green',
      };
    }
    return {
      color: 'red',
      hidden: true,
      children: null,
    };
  }, [submittingError, formik.isValid, formik.submitCount, successMessageVisible, successMessage, showValidationAlert]);

  const buttonProps = useMemo<Omit<ButtonProps, 'children'>>(() => {
    return {
      loading: formik.isSubmitting,
    };
  }, [formik.isSubmitting]);

  return {
    formik,
    alertProps,
    buttonProps,
  };
};
