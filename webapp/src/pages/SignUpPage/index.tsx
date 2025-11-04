import { zSignUpTrpcInput } from '@ideanick/backend/src/router/signUp/input';
import { useFormik } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { useState } from 'react';
import { z } from 'zod';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { FormItems } from '../../components/FormItems';
import { Input } from '../../components/Input';
import { Segment } from '../../components/Segment';
import { trpc } from '../../lib/trpc';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { getAllIdeasRoute } from '../../lib/routes';

export const SignUpPage = () => {
  const navigate = useNavigate();
  const trpcUtils = trpc.useUtils();
  const [submittingError, setSubmittingError] = useState<string | null>(null);
  const signUp = trpc.signUp.useMutation();

  // Создаем расширенную схему валидации
  const signUpValidationSchema = zSignUpTrpcInput
    .extend({
      passwordAgain: z.string().min(1),
    })
    .superRefine((val, ctx) => {
      if (val.password !== val.passwordAgain) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Passwords must be the same',
          path: ['passwordAgain'],
        });
      }
    });

  const formik = useFormik({
    initialValues: {
      nick: '',
      password: '',
      passwordAgain: '',
    },
    validationSchema: toFormikValidationSchema(signUpValidationSchema),
    onSubmit: async (values) => {
      try {
        setSubmittingError(null);
        const { token } = await signUp.mutateAsync(values);
        Cookies.set('token', token, { expires: 99999 });
        void trpcUtils.invalidate();
        navigate(getAllIdeasRoute());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setSubmittingError(err.message);
      }
    },
  });

  return (
    <Segment title="Sign Up">
      <form onSubmit={formik.handleSubmit}>
        <FormItems>
          <Input label="Nick" name="nick" formik={formik} />
          <Input label="Password" name="password" type="password" formik={formik} />
          <Input label="Password again" name="passwordAgain" type="password" formik={formik} />
          {!formik.isValid && !!formik.submitCount && <Alert color="red">Some fields are invalid</Alert>}
          {submittingError && <Alert color="red">{submittingError}</Alert>}
          <Button loading={formik.isSubmitting}>Sign Up</Button>
        </FormItems>
      </form>
    </Segment>
  );
};
