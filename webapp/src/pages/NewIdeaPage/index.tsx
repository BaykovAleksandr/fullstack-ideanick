import { toFormikValidationSchema } from 'zod-formik-adapter';
import { Input } from '../../components/Input';
import { Segment } from '../../components/Segment';
import { Textarea } from '../../components/Textarea';
import { useFormik } from 'formik';
import { z } from 'zod';
import { trpc } from '../../lib/trpc';

const validationSchema = z.object({
  name: z.string().min(1),
  nick: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Nick may contain only lowercase letters, numbers and dashes'),
  description: z.string().min(1),
  text: z.string().min(100, 'Text should be at least 100 characters long'),
});

export const NewIdeaPage = () => {
  const createIdea = trpc.createIdea.useMutation();
  const formik = useFormik({
    initialValues: {
      name: '',
      nick: '',
      description: '',
      text: '',
    },
    validationSchema: toFormikValidationSchema(validationSchema),
    onSubmit: async (values) => {
      await createIdea.mutateAsync(values);
    },
  });

  return (
    <Segment title="New Idea">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          formik.handleSubmit();
        }}
      >
        <Input name="name" label="Name" formik={formik} />
        <Input name="nick" label="Nick" formik={formik} />
        <Input name="description" label="Description" formik={formik} />
        <Textarea name="text" label="Text" formik={formik} />
        {!formik.isValid && !!formik.submitCount && <div style={{ color: 'red' }}>Some fields are invalid</div>}
        <button type="submit">Create Idea</button>
      </form>
    </Segment>
  );
};
