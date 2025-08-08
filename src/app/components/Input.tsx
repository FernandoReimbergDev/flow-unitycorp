interface InputRootProps extends React.ComponentProps<"div"> {
  error?: boolean;
}

export function InputRoot({ error = false, ...props }: InputRootProps) {
  return (
    <div
      className="group w-full flex bg-white h-16 border border-gray-600 rounded-lg px-4 items-center gap-2 focus-within:border-blue-500 focus-within:border-2 data-[error=true]:border-red-500"
      data-error={error}
      {...props}
    />
  );
}

interface InputIconProps extends React.ComponentProps<"span"> {
  error?: boolean;
}

export function InputIcon(props: InputIconProps) {
  return (
    <span
      className="text-gray-400 group-focus-within:text-fontColor group-[&:not(:has(input:placeholder-shown))]:text-fontColor group-data-[error=true]:text-red-500"
      {...props}
    />
  );
}

export function InputField(props: React.ComponentProps<"input">) {
  return (
    <input
      className="flex-1 outline-none placeholder-gray-400 bg-transparent sm:text-xl"
      {...props}
    />
  );
}


