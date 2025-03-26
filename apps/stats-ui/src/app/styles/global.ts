import { css } from 'styled-components';

export const globalStyles = css`
  /* Modern CSS Reset */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* Reset html and body */
  html,
  body {
    margin: 0;
    padding: 0;
    width: 100%;
    overflow-x: hidden;
  }

  /* Remove default margin */
  body,
  h1,
  h2,
  h3,
  h4,
  p,
  figure,
  blockquote,
  dl,
  dd {
    margin: 0;
  }

  /* Set core root defaults */
  html:focus-within {
    scroll-behavior: smooth;
  }

  /* Set core body defaults */
  body {
    margin: 0;
    min-height: 100vh;
    text-rendering: optimizeSpeed;
    line-height: 1.5;
    background-color: #f5f5f5;
    color: #333;
    overflow-x: hidden;
  }

  /* Remove list styles on ul, ol elements */
  ul,
  ol {
    list-style: none;
  }

  /* A elements that don't have a class get default styles */
  a:not([class]) {
    text-decoration-skip-ink: auto;
  }

  /* Make images easier to work with */
  img,
  picture {
    max-width: 100%;
    display: block;
  }

  /* Inherit fonts for inputs and buttons */
  input,
  button,
  textarea,
  select {
    font: inherit;
  }

  /* Remove all animations and transitions for people that prefer not to see them */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* Typography */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.2;
    margin-bottom: 1rem;
    font-weight: 600;
  }

  h1 {
    font-size: 2.5rem;
  }
  h2 {
    font-size: 2rem;
  }
  h3 {
    font-size: 1.75rem;
  }
  h4 {
    font-size: 1.5rem;
  }
  h5 {
    font-size: 1.25rem;
  }
  h6 {
    font-size: 1rem;
  }

  p {
    margin-bottom: 1rem;
  }

  /* Links */
  a {
    color: #0066cc;
    text-decoration: none;
    transition: color 0.2s ease-in-out;

    &:hover {
      color: #004499;
    }
  }

  /* Form elements */
  input,
  textarea,
  select {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #fff;
    transition: border-color 0.2s ease-in-out;

    &:focus {
      outline: none;
      border-color: #0066cc;
      box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
    }
  }

  button {
    cursor: pointer;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background-color: #0066cc;
    color: white;
    font-weight: 500;
    transition: background-color 0.2s ease-in-out;

    &:hover {
      background-color: #004499;
    }

    &:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
  }

  th,
  td {
    padding: 0.75rem;
    border-bottom: 1px solid #ddd;
    text-align: left;
  }

  th {
    font-weight: 600;
    background-color: #f8f9fa;
  }

  /* Code */
  code {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier,
      monospace;
    font-size: 0.875em;
    padding: 0.2em 0.4em;
    background-color: #f8f9fa;
    border-radius: 3px;
  }

  pre {
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 4px;
    overflow-x: auto;
    margin-bottom: 1rem;
  }
`;
