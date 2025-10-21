import {
  type Dispatch,
  type FC,
  type KeyboardEvent,
  type SetStateAction,
  useId,
  useState,
} from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { TTag, TTagId } from "@/types/prisma";
import { TagDisplay } from "./TagDisplay";

type Props = {
  tags: TTag[];
  selectedTags: TTagId[];
  showSelectAll?: boolean;
  onChange: Dispatch<SetStateAction<TTagId[]>>;
};

export const MultipleTagPicker: FC<Props> = ({
  onChange,
  tags,
  selectedTags,
  showSelectAll,
}) => {
  const [inputValue, setInputValue] = useState("");

  const filteredTags = tags?.filter(
    (tag) => !selectedTags.includes(tag.id) && tag.name.includes(inputValue),
  );

  const [_isFocused, setIsFocused] = useState(false);

  const inputId = useId();

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      e.stopPropagation();
      const tag = filteredTags?.find((tag) => tag.name === inputValue);
      if (tag) {
        onChange((prev) => [...prev, tag.id]);
        setInputValue("");
      }
    } else if (
      e.key === "Backspace" &&
      inputValue === "" &&
      selectedTags.length > 0
    ) {
      e.preventDefault();
      e.stopPropagation();
      onChange((prev) => prev.slice(0, -1));
    }
  };

  return (
    <label
      className="p-2 rounded-xl border-2 flex-wrap flex flex-row gap-2 relative max-w-full min-h-[40px]"
      htmlFor={inputId}
    >
      {selectedTags.map((tagId) => {
        const tag = tags?.find((tag) => tag.id === tagId);
        if (!tag) return null;
        return (
          <div key={tagId} className="flex-shrink-0">
            <TagDisplay
              tag={tag}
              onDelete={() => {
                onChange((prev) => prev.filter((v) => v !== tagId));
              }}
              deleteArea="all"
              variant="outline"
            />
          </div>
        );
      })}
      <input
        id={inputId}
        type="text"
        className="outline-none bg-none border-none bg-transparent h-[36px] px-2 peer flex-1 min-w-[80px]"
        onKeyDown={onKeyDown}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 100)}
      />
      <Command
        className={
          "absolute top-full max-h-[300px] h-max hidden peer-focus:block focus:block hover:block w-full z-50"
        }
        autoFocus={false}
      >
        <CommandList>
          <CommandEmpty>No tags found.</CommandEmpty>
          <CommandGroup>
            {showSelectAll && filteredTags.length > 0 && (
              <CommandItem
                onSelect={() => {
                  onChange(tags?.map((tag) => tag.id) || []);
                  setInputValue("");
                }}
              >
                Select All
              </CommandItem>
            )}
            {showSelectAll && filteredTags.length === 0 && (
              <CommandItem
                onSelect={() => {
                  onChange([]);
                  setInputValue("");
                }}
              >
                Clear All
              </CommandItem>
            )}
            {filteredTags?.map((tag) => (
              <CommandItem
                key={tag.id}
                onSelect={() => {
                  onChange((prev) => [...prev, tag.id]);
                  setInputValue("");
                }}
              >
                <TagDisplay tag={tag} />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </label>
  );
};
