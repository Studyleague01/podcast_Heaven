/* @refresh reload */
import { render } from 'solid-js/web';
import { App } from './SolidApp';
import './index.css';

// Mount the app to the DOM using proper SolidJS mounting
const rootElement = document.getElementById('root');
if (rootElement) {
  render(() => <App />, rootElement);
} else {
  console.error("Root element not found!");
}