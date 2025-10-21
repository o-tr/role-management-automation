import type { FC } from "react";
import { MultiSelect } from "@/components/MultiSelect";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createNewMappingCondition,
  type TMappingComparator,
  type TMappingCondition,
  type TMappingConditionAnd,
  type TMappingConditionComparator,
  type TMappingConditionId,
  type TMappingConditionNot,
  type TMappingConditionOr,
  type TMappingKey,
  type TMappingType,
  type TMappingValue,
  ZMappingComparators,
  ZMappingKeys,
  ZMappingTypes,
} from "@/types/conditions";
import { TagDisplay } from "../../../components/TagDisplay";
import { useTags } from "../../_hooks/use-tags";

type Props<T extends TMappingCondition> = {
  nsId: string;
  conditions: T;
  onChange: (conditions: T) => void;
};

const typesLabel: { [key in TMappingType]: string } = {
  comparator: "比較",
  not: "否定",
  and: "かつ",
  or: "または",
};

export const ConditionsEditor: FC<Props<TMappingCondition>> = ({
  conditions,
  onChange,
  nsId,
}) => {
  const onChangeType = (value: TMappingType) => {
    onChange(createNewMappingCondition(value));
  };

  return (
    <Card className="flex flex-row space-x-2 items-center px-2 py-1">
      <FormItem>
        <Select
          value={conditions.type}
          onValueChange={(value) => onChangeType(value as TMappingType)}
        >
          <SelectTrigger>
            <SelectValue>{typesLabel[conditions.type]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {ZMappingTypes.map((key) => (
              <SelectItem key={key} value={key}>
                {typesLabel[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormItem>
      {conditions.type === "comparator" && (
        <ConditionsEditorComparator
          conditions={conditions as TMappingConditionComparator}
          onChange={(value) => onChange(value)}
          nsId={nsId}
        />
      )}
      {conditions.type === "not" && (
        <ConditionsEditorNot
          conditions={conditions as TMappingConditionNot}
          onChange={(value) => onChange(value)}
          nsId={nsId}
        />
      )}
      {conditions.type === "and" && (
        <ConditionsEditorAnd
          conditions={conditions as TMappingConditionAnd}
          onChange={(value) => onChange(value)}
          nsId={nsId}
        />
      )}
      {conditions.type === "or" && (
        <ConditionsEditorOr
          conditions={conditions as TMappingConditionOr}
          onChange={(value) => onChange(value)}
          nsId={nsId}
        />
      )}
    </Card>
  );
};

export const ConditionsEditorOr: FC<Props<TMappingConditionOr>> = ({
  conditions,
  onChange,
  nsId,
}) => {
  const { tags } = useTags(nsId);
  const hasTags = tags && tags.length > 0;

  return (
    <div className="flex flex-col space-y-1">
      {conditions.conditions.map((condition, index) => (
        <div
          key={condition.id}
          className="flex flex-row space-x-1 items-center"
        >
          <ConditionsEditor
            conditions={condition}
            onChange={(value) =>
              onChange({
                ...conditions,
                conditions: conditions.conditions.map((c, i) =>
                  i === index ? value : c,
                ),
              })
            }
            nsId={nsId}
          />
          <Button
            type="button"
            onClick={() =>
              onChange({
                ...conditions,
                conditions: conditions.conditions.filter((_, i) => i !== index),
              })
            }
            variant={"secondary"}
          >
            条件を削除
          </Button>
        </div>
      ))}
      <div>
        <Button
          type="button"
          disabled={!hasTags}
          onClick={() => {
            if (!hasTags) return;
            onChange({
              ...conditions,
              conditions: [
                ...conditions.conditions,
                {
                  type: "comparator",
                  key: "some-tag",
                  comparator: "equals",
                  value: tags[0].id as TMappingValue,
                  id: crypto.randomUUID() as TMappingConditionId,
                },
              ],
            });
          }}
          title={!hasTags ? "タグを作成してください" : undefined}
        >
          条件を追加
        </Button>
      </div>
    </div>
  );
};

export const ConditionsEditorAnd: FC<Props<TMappingConditionAnd>> = ({
  conditions,
  onChange,
  nsId,
}) => {
  const { tags } = useTags(nsId);
  const hasTags = tags && tags.length > 0;

  return (
    <div className="flex flex-col space-y-1">
      {conditions.conditions.map((condition, index) => (
        <div
          key={condition.id}
          className="flex flex-row space-x-1 items-center"
        >
          <ConditionsEditor
            conditions={condition}
            onChange={(value) =>
              onChange({
                ...conditions,
                conditions: conditions.conditions.map((c, i) =>
                  i === index ? value : c,
                ),
              })
            }
            nsId={nsId}
          />
          <Button
            type="button"
            onClick={() =>
              onChange({
                ...conditions,
                conditions: conditions.conditions.filter((_, i) => i !== index),
              })
            }
            variant={"secondary"}
          >
            条件を削除
          </Button>
        </div>
      ))}
      <div>
        <Button
          type="button"
          disabled={!hasTags}
          onClick={() => {
            if (!hasTags) return;
            onChange({
              ...conditions,
              conditions: [
                ...conditions.conditions,
                {
                  type: "comparator",
                  key: "some-tag",
                  comparator: "equals",
                  value: tags[0].id as TMappingValue,
                  id: crypto.randomUUID() as TMappingConditionId,
                },
              ],
            });
          }}
          title={!hasTags ? "タグを作成してください" : undefined}
        >
          条件を追加
        </Button>
      </div>
    </div>
  );
};

export const ConditionsEditorNot: FC<Props<TMappingConditionNot>> = ({
  conditions,
  onChange,
  nsId,
}) => {
  return (
    <div className="p-1">
      <ConditionsEditor
        conditions={conditions.condition}
        onChange={(value) => onChange({ ...conditions, condition: value })}
        nsId={nsId}
      />
    </div>
  );
};

const keysLabel = {
  "some-tag": "いずれかのタグ",
};

const comparatorLabel = {
  notEquals: "一致しない",
  equals: "一致する",
  "contains-any": "いずれかを含む",
  "contains-all": "すべてを含む",
};

export const ConditionsEditorComparator: FC<
  Props<TMappingConditionComparator>
> = ({ conditions, onChange, nsId }) => {
  const { tags } = useTags(nsId);

  const isArrayValue = Array.isArray(conditions.value);
  const selectedTag = isArrayValue
    ? null
    : tags?.find((tag) => tag.id === conditions.value);

  const isMultiSelect =
    conditions.comparator === "contains-any" ||
    conditions.comparator === "contains-all";

  return (
    <div className="flex flex-row space-x-1 items-center p-1">
      <FormItem>
        <Select
          value={conditions.key}
          onValueChange={(value) =>
            onChange({ ...conditions, key: value as TMappingKey })
          }
        >
          <SelectTrigger>
            <SelectValue>{keysLabel[conditions.key]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {ZMappingKeys.map((key) => (
              <SelectItem key={key} value={key}>
                {keysLabel[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormItem>
      <span>が</span>
      {isMultiSelect ? (
        <FormItem>
          <MultiSelect
            options={
              tags?.map((tag) => ({
                value: tag.id,
                label: tag.name,
              })) || []
            }
            selected={isArrayValue ? (conditions.value as string[]) : []}
            onChange={(values) =>
              onChange({ ...conditions, value: values as TMappingValue[] })
            }
            placeholder="タグを選択..."
          />
        </FormItem>
      ) : (
        <FormItem>
          <Select
            value={isArrayValue ? "" : (conditions.value as string)}
            onValueChange={(value) =>
              onChange({ ...conditions, value: value as TMappingValue })
            }
          >
            <SelectTrigger>
              <SelectValue>
                {selectedTag && <TagDisplay tag={selectedTag} />}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {tags?.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  <TagDisplay tag={tag} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
      <span>と</span>
      <FormItem>
        <Select
          value={conditions.comparator}
          onValueChange={(value) => {
            const newComparator = value as TMappingComparator;
            const isNewMultiSelect =
              newComparator === "contains-any" ||
              newComparator === "contains-all";

            let newValue: TMappingValue | TMappingValue[];
            if (isNewMultiSelect && !isMultiSelect) {
              // 単一選択から複数選択に変更
              newValue = Array.isArray(conditions.value)
                ? conditions.value
                : ([conditions.value] as TMappingValue[]);
            } else if (!isNewMultiSelect && isMultiSelect) {
              // 複数選択から単一選択に変更
              const arrayValue = Array.isArray(conditions.value)
                ? conditions.value
                : [conditions.value];
              newValue = (arrayValue[0] ?? tags?.[0]?.id) as TMappingValue;
            } else {
              newValue = conditions.value;
            }

            onChange({
              ...conditions,
              comparator: newComparator,
              value: newValue,
            });
          }}
        >
          <SelectTrigger>
            <SelectValue>{comparatorLabel[conditions.comparator]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {ZMappingComparators.map((key) => (
              <SelectItem key={key} value={key}>
                {comparatorLabel[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormItem>
    </div>
  );
};
