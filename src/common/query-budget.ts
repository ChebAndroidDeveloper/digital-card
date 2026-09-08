import { GraphQLError, Kind, type SelectionSetNode, type ValidationRule } from 'graphql';

// Count expanded selections, so aliases and repeated fragments consume the budget.
export const queryBudget: ValidationRule = (context) => ({
  OperationDefinition(operation) {
    // Льготный бюджет разрешён ТОЛЬКО для чистых служебных запросов схемы (__schema, __type, __typename).
    // Если в запросе есть хотя бы одно пользовательское поле (profile и т.д.), льгота НЕ применяется,
    // даже если запрос назван "IntrospectionQuery" или подмешан к __schema.
    const isPureIntrospection =
      operation.selectionSet.selections.length > 0 &&
      operation.selectionSet.selections.every(
        (s) =>
          s.kind === Kind.FIELD &&
          (s.name.value === '__schema' || s.name.value === '__type' || s.name.value === '__typename'),
      );

    let remaining = isPureIntrospection ? 2000 : 500;
    const maxDepth = isPureIntrospection ? 20 : 12;

    const walk = (set: SelectionSetNode, depth: number, ancestors: Set<string>): boolean => {
      if (depth > maxDepth) return false;
      for (const selection of set.selections) {
        if (--remaining < 0) return false;
        if (selection.kind === Kind.FRAGMENT_SPREAD) {
          const name = selection.name.value;
          if (ancestors.has(name)) continue; // GraphQL's cycle rule reports this.
          const fragment = context.getFragment(name);
          if (fragment && !walk(fragment.selectionSet, depth, new Set([...ancestors, name]))) return false;
        } else if (selection.selectionSet) {
          const nextDepth = depth + (selection.kind === Kind.FIELD ? 1 : 0);
          if (!walk(selection.selectionSet, nextDepth, ancestors)) return false;
        }
      }
      return true;
    };

    if (!walk(operation.selectionSet, 1, new Set())) {
      context.reportError(
        new GraphQLError(
          `Query exceeds the limit of ${isPureIntrospection ? 2000 : 500} selections or ${maxDepth} levels.`,
          { nodes: operation },
        ),
      );
    }
  },
});