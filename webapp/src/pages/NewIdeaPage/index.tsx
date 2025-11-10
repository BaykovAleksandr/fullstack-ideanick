//import { toFormikValidationSchema } from 'zod-formik-adapter';
import { Input } from '../../components/Input';
import { Segment } from '../../components/Segment';
import { Textarea } from '../../components/Textarea';
//import { useFormik } from 'formik';
import { zCreateIdeaTrpcInput } from '@ideanick/backend/src/router/createIdea/input';
import { trpc } from '../../lib/trpc';
//import { useState } from 'react';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { FormItems } from '../../components/FormItems';
import { useForm } from '../../lib/form';

export const NewIdeaPage = () => {
  const createIdea = trpc.createIdea.useMutation();
  const { formik, buttonProps, alertProps } = useForm({
    initialValues: {
      name: '',
      nick: '',
      description: '',
      text: '',
    },
    validationSchema: zCreateIdeaTrpcInput,
    onSubmit: async (values) => {
      await createIdea.mutateAsync(values);
      formik.resetForm();
    },
    successMessage: 'Idea created!',
    showValidationAlert: true,
  });

  return (
    <Segment title="New Idea">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          formik.handleSubmit();
        }}
      >
        <FormItems>
          <Input name="name" label="Name" formik={formik} />
          <Input name="nick" label="Nick" formik={formik} />
          <Input name="description" label="Description" formik={formik} maxWidth={500} />
          <Textarea name="text" label="Text" formik={formik} />
          <Alert {...alertProps} />
          <Button {...buttonProps}>Create Idea</Button>
        </FormItems>
      </form>
    </Segment>
  );
};
