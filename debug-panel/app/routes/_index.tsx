import { ActionFunction, MetaFunction, json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { query, reindex, runRetrieval, runSplitter } from "~/debug.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const action: ActionFunction = async ({request}) => {
  const formData = await request.formData();
  const actionType = formData.get("_action");
  console.log(formData);
  switch (actionType) {
    case 'runSplitter':
      return runSplitter(
        formData.get('chunk-size') as unknown as number,
        formData.get('chunk-overlap') as unknown as number,
        formData.get('directory') as unknown as string,
      );
    case 'reindex':
      return reindex(
        formData.get('chunk-size') as unknown as number,
        formData.get('chunk-overlap') as unknown as number,
        formData.get('directory') as unknown as string,
      );
    case 'runRetrieval':
      return runRetrieval(
        formData.get('k-value') as unknown as number,
        formData.get('fetch-k') as unknown as number,
        formData.get('search-type') as unknown as string,
        formData.get('query') as unknown as string,
      );
    case 'generateCode':
      return query(
        formData.get('query') as unknown as string,
        true,
      );
    case 'askQuestion':
      return query(
        formData.get('query') as unknown as string,
        false,
      );
    default:
      return json({error: `Unknown action type: ${actionType}`})
  } 
}

export default function Index() {
  const actionData = useActionData();

  return (
    <div  className="max-w-2xl mx-auto ">
    <h1 className="text-xl font-semibold">Vector Store</h1>
      <div className="container  p-4 columns-3xs">
        <Form method="post">
          <div className="break-inside-avoid">
            <h2 className="text-lg font-semibold">Splitter</h2>
            <FormTextInput label="Directory" name="directory" type="text" defaultValue="/home/brannt/workspace/coderagent/data/modal.com" />
            <FormTextInput label="Language" name="language" type="text" defaultValue="html" />
            <FormTextInput label="Chunk size" name="chunk-size" type="number" defaultValue="500" />
            <FormTextInput label="Chunk overlap" name="chunk-overlap" type="number" defaultValue="100" />
            <FormSubmitButton text="Run Splitter" value="runSplitter" />
            <FormSubmitButton text="Reindex" value="reindex" />
          </div>
        </Form>

        <Form method="post">
          <div className="break-inside-avoid">
            <h2 className="text-lg font-semibold">Retrieval</h2>
            {/* // Running retrieval with search type ${message.searchType} and k value ${message.kValue} and fetch k ${message.fetchK} and query ${message.query}`; */}
            <FormTextInput label="k" name="k-value" type="number" defaultValue="3"/>
            <FormTextInput label="fetch k" name="fetch-k" type="number" defaultValue="3"/>
            <FormTextInput label="Search type" name="search-type" type="text" defaultValue=""/>
            <FormTextboxInput label="Query" name="query" type="text" defaultValue=""/>
            <FormSubmitButton text="Run Retrieval" value="runRetrieval" />
          </div>
        </Form>
      </div>

      <Form method="post">
      <div className="p-4 break-inside-avoid">
        <h2 className="text-lg font-semibold">Codegen</h2>
        <FormTextboxInput label="Query" name="query" type="text" defaultValue=""/>
        <FormSubmitButton text="Generate Code" value="generateCode" />
        <FormSubmitButton text="Ask Question" value="askQuestion" />
      </div>
      </Form>

  
      {actionData ? <Result result={actionData}/> : null}
    </div>
  );
}


interface TextInputProps {
  label: string;
  name: string;
  type: string;
  defaultValue: string;
}

function FormTextInput({label, name, type, defaultValue}: TextInputProps) {
 return (
    <>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
      <input type={type} id={name} name={name} defaultValue={defaultValue} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-sm p-2"/>
    </>
  )
}

function FormTextboxInput({label, name, type, defaultValue}: TextInputProps) {
  return (
      <>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <textarea id={name} name={name} defaultValue={defaultValue} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-sm p-2"/>
      </>
    )
  }

interface SubmitButtonProps {
  text: string;
  value: string;
}

function FormSubmitButton({text, value}: SubmitButtonProps) {
 return <button type="submit" name="_action" value={value} className="mt-2 px-4 py-2 p-4 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-700" >{text}</button>
}

function Result({result}: {result: Record<string, string>}) {
  console.log(result);
  const resultKeys = Object.keys(result);
  if (resultKeys.length === 1) {
    return <pre className="max-h-96 overflow-auto">{result[resultKeys[0]]}</pre>
  }
  const resultString = resultKeys.map((key) => `${key}\n${result[key]}`).join('\n\n');
  return <pre className="max-h-96 overflow-auto">{resultString}</pre>
}