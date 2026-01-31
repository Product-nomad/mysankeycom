import { useMemo } from 'react';
import type { SankeyData } from '@/types/sankey';

interface FlowJsonLdProps {
  title: string;
  description?: string | null;
  data: SankeyData;
  url: string;
  createdAt: string;
  updatedAt: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

const FlowJsonLd = ({
  title,
  description,
  data,
  url,
  createdAt,
  updatedAt,
}: FlowJsonLdProps) => {
  const jsonLd = useMemo(() => {
    // Extract variable names from nodes
    const variables = data.nodes.slice(0, 10).map((node) => node.name);
    
    // Calculate total flow value
    const totalValue = data.links.reduce((sum, link) => sum + link.value, 0);
    
    // Determine spatial coverage from title/description keywords
    const spatialKeywords = ['global', 'world', 'us', 'usa', 'united states', 'europe', 'asia', 'uk', 'china'];
    const titleLower = title.toLowerCase();
    const descLower = (description || '').toLowerCase();
    let spatialCoverage = 'Global';
    
    for (const keyword of spatialKeywords) {
      if (titleLower.includes(keyword) || descLower.includes(keyword)) {
        if (keyword === 'us' || keyword === 'usa' || keyword === 'united states') {
          spatialCoverage = 'United States';
        } else if (keyword === 'uk') {
          spatialCoverage = 'United Kingdom';
        } else if (keyword === 'europe') {
          spatialCoverage = 'Europe';
        } else if (keyword === 'asia') {
          spatialCoverage = 'Asia';
        } else if (keyword === 'china') {
          spatialCoverage = 'China';
        }
        break;
      }
    }

    // Dataset schema
    const datasetSchema = {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: title,
      description: description || `Interactive Sankey diagram visualization of ${title}`,
      url,
      license: 'https://creativecommons.org/licenses/by/4.0/',
      creator: {
        '@type': 'Organization',
        name: 'MySankey',
        url: 'https://mysankey.com',
      },
      dateCreated: createdAt,
      dateModified: updatedAt,
      spatialCoverage,
      variableMeasured: variables.map((v) => ({
        '@type': 'PropertyValue',
        name: v,
        unitText: data.unit || 'units',
      })),
      distribution: {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: url,
      },
      measurementTechnique: 'Flow analysis and aggregation',
      keywords: [...variables.slice(0, 5), 'sankey diagram', 'flow visualization', 'data analysis'].join(', '),
    };

    // Generate FAQ items based on the data
    const faqItems: FAQItem[] = [
      {
        question: `What does the ${title} diagram show?`,
        answer: description || `This Sankey diagram visualizes the flow relationships in ${title}, showing how ${variables.slice(0, 3).join(', ')} and other elements are connected. The width of each flow represents the magnitude of the relationship${data.unit ? ` measured in ${data.unit}` : ''}.`,
      },
      {
        question: `How many data points are in this ${title} visualization?`,
        answer: `This visualization contains ${data.nodes.length} nodes and ${data.links.length} flow connections, with a total flow value of ${totalValue.toLocaleString()}${data.unit ? ` ${data.unit}` : ''}.`,
      },
      {
        question: `What are the main sources in this flow diagram?`,
        answer: `The primary sources in this diagram include ${variables.slice(0, 5).join(', ')}. Each source contributes to the overall flow pattern shown in the visualization.`,
      },
    ];

    // Add data source question if sources exist
    if (data.sources && data.sources.length > 0) {
      const sourceNames = data.sources.map((s) => s.name).join(', ');
      faqItems.push({
        question: 'What are the data sources for this visualization?',
        answer: `This diagram uses data from: ${sourceNames}. The data has been processed and visualized to show flow relationships.`,
      });
    }

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    };

    return [datasetSchema, faqSchema];
  }, [title, description, data, url, createdAt, updatedAt]);

  return (
    <>
      {jsonLd.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
};

export default FlowJsonLd;
