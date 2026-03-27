import { render, screen } from '@testing-library/react';

import PageHeader from '../components/PageHeader.jsx';

describe('PageHeader', () => {
  test('renders title and subtitle', () => {
    render(
      <PageHeader
        eyebrow="Analytics"
        title="Track performance"
        subtitle="Watch the workspace trendline."
      />,
    );

    expect(screen.getByText('Track performance')).toBeInTheDocument();
    expect(screen.getByText('Watch the workspace trendline.')).toBeInTheDocument();
  });
});
