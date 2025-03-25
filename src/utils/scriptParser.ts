import { ScriptLine } from '@/models/types';

/**
 * Parses a raw script text into an array of ScriptLine objects
 * @param rawScript The raw script text in the format:
 * CHARACTER: Dialogue text.
 * (Voice instructions)
 */
export function parseScript(rawScript: string): ScriptLine[] {
  const lines: ScriptLine[] = [];
  const rawLines = rawScript.split('\n').filter(line => line.trim() !== '');
  
  let currentCharacter = '';
  let currentText = '';
  let currentInstructions = '';
  let collectingInstructions = false;
  
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    
    // Check if this is a character line (contains ":" not inside parentheses)
    const characterMatch = line.match(/^([A-Z][A-Z\s]*[A-Z]?):\s(.+)$/);
    
    if (characterMatch && !line.startsWith('(')) {
      // If we have a previous character's dialogue, add it to our list
      if (currentCharacter && currentText) {
        lines.push({
          characterName: currentCharacter,
          text: currentText,
          instructions: currentInstructions || undefined
        });
      }
      
      // Start new character dialogue
      currentCharacter = characterMatch[1].trim();
      currentText = characterMatch[2].trim();
      currentInstructions = '';
      collectingInstructions = false;
    } 
    // Check if this is an instruction line (starts with parenthesis)
    else if (line.startsWith('(') && line.endsWith(')')) {
      currentInstructions = line.substring(1, line.length - 1).trim();
      collectingInstructions = false;
    }
    // Check if this is the start of multi-line instructions
    else if (line.startsWith('(') && !line.endsWith(')')) {
      currentInstructions = line.substring(1).trim();
      collectingInstructions = true;
    }
    // Check if this is the end of multi-line instructions
    else if (collectingInstructions && line.endsWith(')')) {
      currentInstructions += ' ' + line.substring(0, line.length - 1).trim();
      collectingInstructions = false;
    }
    // If we're collecting instructions, continue appending
    else if (collectingInstructions) {
      currentInstructions += ' ' + line.trim();
    }
    // Otherwise, it's continuation of previous dialogue
    else if (currentCharacter) {
      currentText += ' ' + line;
    }
  }
  
  // Add the last character's dialogue if we have one
  if (currentCharacter && currentText) {
    lines.push({
      characterName: currentCharacter,
      text: currentText,
      instructions: currentInstructions || undefined
    });
  }
  
  return lines;
}

/**
 * Validates a character name against available characters
 * @param name The character name to validate
 * @param availableCharacters List of available character names
 * @returns An object with validation result and missing characters
 */
export function validateScriptCharacters(
  scriptLines: ScriptLine[],
  availableCharacters: string[]
): {
  isValid: boolean;
  missingCharacters: string[];
} {
  const missingCharacters: string[] = [];
  
  for (const line of scriptLines) {
    if (!availableCharacters.includes(line.characterName) && 
        !missingCharacters.includes(line.characterName)) {
      missingCharacters.push(line.characterName);
    }
  }
  
  return {
    isValid: missingCharacters.length === 0,
    missingCharacters
  };
} 