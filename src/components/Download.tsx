import { useCallback } from "react";

export type DownloadButtonProps = {
  contents: () => Blob;
  filename: string;
  children: React.ReactNode;
  className?: string;
};

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  contents,
  filename,
  children,
  className,
}) => {
  const onClick = useCallback(() => {
    const blob = contents();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }, [contents, filename]);

  return (
    <button
      className={
        "flex gap-2 items-center bg-purple-600 px-2 py-1 rounded-md hover:bg-purple-400 active:bg-purple-400" +
        className
      }
      onClick={onClick}
    >
      {children}
    </button>
  );
};
