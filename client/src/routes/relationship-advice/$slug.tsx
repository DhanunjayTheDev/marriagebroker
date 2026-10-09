import { createFileRoute } from '@tanstack/react-router';
import { RelationshipAdviceArticlePage } from '../../pages/public/RelationshipAdviceArticlePage';

export const Route = createFileRoute('/relationship-advice/$slug')({
  component: RelationshipAdviceArticlePage,
});
