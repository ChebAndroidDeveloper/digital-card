import { unwrapResolverError, ApolloServerErrorCode } from '@apollo/server/errors';
import { GraphQLFormattedError } from 'graphql';

export function formatGraphQLError(
  formattedError: GraphQLFormattedError,
  error: unknown,
): GraphQLFormattedError {
  if (process.env.NODE_ENV === 'production') {
    const code = formattedError.extensions?.code;
    const isClientSafe =
      code === ApolloServerErrorCode.GRAPHQL_PARSE_FAILED ||
      code === ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED ||
      code === ApolloServerErrorCode.BAD_USER_INPUT;

    if (!isClientSafe) {
      const originalError = unwrapResolverError(error);
      console.error('[GraphQL Internal Error]:', originalError);

      return {
        message: 'Internal server error',
        locations: formattedError.locations,
        path: formattedError.path,
        extensions: {
          code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
        },
      };
    }

    return {
      message: formattedError.message,
      locations: formattedError.locations,
      path: formattedError.path,
      extensions: { code },
    };
  }
  return formattedError;
}