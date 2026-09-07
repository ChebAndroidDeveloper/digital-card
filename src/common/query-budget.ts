import { GraphQLError, Kind, type SelectionSetNode, type ValidationRule } from 'graphql';

// Count expanded selections, so aliases and repeated fragments consume the budget.
export const queryBudget: ValidationRule = (context) => ({
  OperationDefinition(operation) {
    // Служебная интроспекция Apollo Sandbox (__schema) требует больше уровней и полей
    const isIntrospection =
      operation.name?.value === 'IntrospectionQuery' ||
      operation.selectionSet.selections.some(
        (s) => s.kind === Kind.FIELD && (s.name.value === '__schema' || s.name.value === '__type'),
      );

    let remaining = isIntrospection ? 2000 : 500;
    const maxDepth = isIntrospection ? 20 : 12;

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
          `Query exceeds the limit of ${isIntrospection ? 2000 : 500} selections or ${maxDepth} levels.`,
          { nodes: operation },
        ),
      );
    }
  },
});