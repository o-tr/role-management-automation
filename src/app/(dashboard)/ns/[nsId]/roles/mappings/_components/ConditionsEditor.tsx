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
  createNewMappingCondition,
} from "@/types/conditions";
import type { FC } from "react";
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
          onClick={() =>
            onChange({
              ...conditions,
              conditions: [
                ...conditions.conditions,
                {
                  type: "comparator",
                  key: "some-tag",
                  comparator: "equals",
                  value: "some-value" as TMappingValue,
                  id: crypto.randomUUID() as TMappingConditionId,
                },
              ],
            })
          }
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
          onClick={() =>
            onChange({
              ...conditions,
              conditions: [
                ...conditions.conditions,
                {
                  type: "comparator",
                  key: "some-tag",
                  comparator: "equals",
                  value: "some-value" as TMappingValue,
                  id: crypto.randomUUID() as TMappingConditionId,
                },
              ],
            })
          }
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
};

export const ConditionsEditorComparator: FC<
  Props<TMappingConditionComparator>
> = ({ conditions, onChange, nsId }) => {
  const { tags } = useTags(nsId);

  const selectedTag = tags?.find((tag) => tag.id === conditions.value);

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
      <FormItem>
        <Select
          value={conditions.value}
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
      <span>と</span>
      <FormItem>
        <Select
          value={conditions.comparator}
          onValueChange={(value) =>
            onChange({ ...conditions, comparator: value as TMappingComparator })
          }
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
