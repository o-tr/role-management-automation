import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { type FC, type KeyboardEvent, useEffect, useId, useState } from "react";
import { useTags } from "../roles/_hooks/use-tags";

type Props = {
  namespacedId: string;
  onChange: (tags: string[]) => void;
};

export const MultipleTagPicker: FC<Props> = ({ namespacedId, onChange }) => {
  const { tags } = useTags(namespacedId);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  const filteredTags = tags?.filter(
    (tag) => !selectedTags.includes(tag.id) && tag.name.includes(inputValue),
  );

  const [isFocused, setIsFocused] = useState(false);

  const inputId = useId();

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      const tag = filteredTags?.find((tag) => tag.name === inputValue);
      if (tag) {
        setSelectedTags((prev) => [...prev, tag.id]);
        setInputValue("");
      }
    } else if (
      e.key === "Backspace" &&
      inputValue === "" &&
      selectedTags.length > 0
    ) {
      setSelectedTags((prev) => prev.slice(0, -1));
    }
  };

  useEffect(() => {
    onChange(selectedTags);
  }, [selectedTags, onChange]);

  return (
    <label
      className="p-2 rounded-2xl border-2 flex-wrap flex flex-row gap-2 relative"
      htmlFor={inputId}
    >
      {selectedTags.map((tagId) => {
        const tag = tags?.find((tag) => tag.id === tagId);
        return (
          <span
            key={tagId}
            className="px-4 py-1 rounded-xl flex flex-row items-center border-2"
          >
            {tag?.name}
            <button
              className="ml-2"
              type="button"
              onClick={() => {
                setSelectedTags((prev) => prev.filter((v) => v !== tagId));
              }}
            >
              x
            </button>
          </span>
        );
      })}
      <input
        id={inputId}
        type="text"
        className="outline-none bg-none border-none bg-transparent h-[36px] px-2 w-[50px]"
        onKeyDown={onKeyDown}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 100)}
      />
      <Command
        className={`absolute top-full max-h-[200px] ${isFocused && inputValue.length > 1 ? "block" : "hidden"} focus:block`}
        autoFocus={false}
      >
        <CommandList>
          <CommandEmpty>No tags found.</CommandEmpty>
          <CommandGroup>
            {filteredTags?.map((tag) => (
              <CommandItem
                key={tag.id}
                onSelect={() => {
                  console.log("selected", tag);
                  setSelectedTags((prev) => [...prev, tag.id]);
                  setInputValue("");
                }}
              >
                {tag.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </label>
  );
};
