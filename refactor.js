const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'app')).concat(walk(path.join(__dirname, 'src/components')));

let refactored = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes("from '@/src/theme'") && content.includes('StyleSheet.create')) {
    // 1. replace static colors/gradients imports
    let hasColors = content.includes('colors');
    let hasGradients = content.includes('gradients');
    
    // We will inject useTheme hook
    if (hasColors || hasGradients) {
      if (!content.includes('useTheme')) {
        content = "import { useTheme } from '@/src/theme/ThemeContext';\n" + content;
      }
      
      // Replace StyleSheet.create( with useStyles = (colors, gradients) => StyleSheet.create(
      content = content.replace(/const styles = StyleSheet\.create\(\{/g, 'const useStyles = (colors: any, gradients: any) => StyleSheet.create({');
      
      // Inject inside component
      // Find export default function XYZ() { or function XYZ() {
      // and inject const { colors, gradients } = useTheme(); const styles = useStyles(colors, gradients);
      
      const componentRegex = /(export\s+)?(default\s+)?function\s+([A-Za-z0-9_]+)\s*\([^)]*\)\s*\{/g;
      let match;
      let injected = false;
      
      // We only inject in the first component found
      let newContent = content;
      while ((match = componentRegex.exec(content)) !== null) {
        if (!injected) {
          const injectStr = `\n  const { colors, gradients } = useTheme();\n  const styles = useStyles(colors, gradients);\n`;
          const insertIdx = match.index + match[0].length;
          newContent = newContent.slice(0, insertIdx) + injectStr + newContent.slice(insertIdx);
          injected = true;
        }
      }
      
      content = newContent;
      fs.writeFileSync(file, content, 'utf8');
      refactored++;
    }
  }
});

console.log(`Refactored ${refactored} files`);
