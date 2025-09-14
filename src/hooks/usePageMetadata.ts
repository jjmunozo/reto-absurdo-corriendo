import { useEffect } from 'react';

interface PageMetadata {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export const usePageMetadata = (metadata: PageMetadata) => {
  useEffect(() => {
    // Store original values
    const originalTitle = document.title;
    const originalDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
    const originalOgTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
    const originalOgDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
    const originalOgImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');

    // Update title
    if (metadata.title) {
      document.title = metadata.title;
    }

    // Update description
    if (metadata.description) {
      const descriptionMeta = document.querySelector('meta[name="description"]');
      if (descriptionMeta) {
        descriptionMeta.setAttribute('content', metadata.description);
      }
    }

    // Update Open Graph title
    if (metadata.ogTitle) {
      const ogTitleMeta = document.querySelector('meta[property="og:title"]');
      if (ogTitleMeta) {
        ogTitleMeta.setAttribute('content', metadata.ogTitle);
      }
    }

    // Update Open Graph description
    if (metadata.ogDescription) {
      const ogDescriptionMeta = document.querySelector('meta[property="og:description"]');
      if (ogDescriptionMeta) {
        ogDescriptionMeta.setAttribute('content', metadata.ogDescription);
      }
    }

    // Update Open Graph image
    if (metadata.ogImage) {
      const ogImageMeta = document.querySelector('meta[property="og:image"]');
      if (ogImageMeta) {
        ogImageMeta.setAttribute('content', metadata.ogImage);
      }
    }

    // Cleanup function to restore original values
    return () => {
      document.title = originalTitle;
      
      if (originalDescription) {
        const descriptionMeta = document.querySelector('meta[name="description"]');
        if (descriptionMeta) {
          descriptionMeta.setAttribute('content', originalDescription);
        }
      }

      if (originalOgTitle) {
        const ogTitleMeta = document.querySelector('meta[property="og:title"]');
        if (ogTitleMeta) {
          ogTitleMeta.setAttribute('content', originalOgTitle);
        }
      }

      if (originalOgDescription) {
        const ogDescriptionMeta = document.querySelector('meta[property="og:description"]');
        if (ogDescriptionMeta) {
          ogDescriptionMeta.setAttribute('content', originalOgDescription);
        }
      }

      if (originalOgImage) {
        const ogImageMeta = document.querySelector('meta[property="og:image"]');
        if (ogImageMeta) {
          ogImageMeta.setAttribute('content', originalOgImage);
        }
      }
    };
  }, [metadata]);
};