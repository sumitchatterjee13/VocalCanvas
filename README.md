# Story App - AI-Powered Voice Script Generator

A modern web application that allows storytellers, voice-over artists, and content creators to write scripts with detailed voice instructions, generate AI voice audio, and export high-quality audio files.


## Features

- **Character Management**: Create and manage characters with different voice profiles
- **Script Editor**: Write and organize dialogue lines with character assignments
- **Voice Instructions**: Add detailed instructions for tone, pacing, emphasis, and emotion
- **AI Voice Generation**: Generate high-quality voice audio using OpenAI's TTS models
- **Audio Preview**: Listen to individual lines or play the entire script
- **Export Options**: Export as individual audio files (ZIP) or a single combined file
- **Script Formatting**: AI-powered script formatter to enhance dialogue with professional voice instructions
- **Story Management**: Save, load, and manage multiple stories

## Installation

### Prerequisites

- Node.js (v14 or higher)
- NPM or Yarn
- OpenAI API key

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/sumitchatterjee13/VocalCanvas.git
   cd story-app
   ```

2. Install dependencies:
   
   **Using installation scripts:**
   - Windows: Run `install.bat` by double-clicking or from command prompt
   - macOS/Linux: Run `./install.sh` in terminal (you may need to set permissions with `chmod +x install.sh`)
   
   **Manually:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. Environment setup:
   - Rename `.env.local.example` to `.env.local`
   - Add your OpenAI API key:
     ```
     OPENAI_API_KEY=your_api_key_here
     ```
   - Optionally configure AI models:
     ```
     FORMATTER_MODEL=gpt-4o-mini
     ```

4. Start the application:

   **Using run scripts:**
   - Windows: Run `run.bat` by double-clicking or from command prompt
   - macOS/Linux: Run `./run.sh` in terminal (you may need to set permissions with `chmod +x run.sh`)
   
   The application will automatically open in your default web browser.
   
   **Manually:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. If starting manually, open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

### Creating Characters

1. Navigate to the "Characters" panel on the left side
2. Enter a character name
3. Select a voice from the dropdown menu (options include alloy, echo, fable, onyx, nova, and more)
4. Click "Add Character"

### Writing Dialogue

1. In the "Add Dialogue Line" section:
   - Select a character from the dropdown
   - Write the dialogue text
   - Optionally add voice instructions
   - Click "Add Line"

2. Manage existing lines:
   - Play: Listen to individual lines
   - Edit: Modify the text or instructions
   - Delete: Remove a line
   - Drag and drop: Reorder lines

### Using the AI Script Formatter

1. Click the "Format Script" button in the top navigation bar
2. In the popup, paste your raw dialogue text in this format:
   ```
   CHARACTER: Dialogue text. (Acting directions)
   ```
   
3. Click "Format with AI"
4. The AI will transform your dialogue into professionally formatted lines with detailed voice instructions:
   ```
   CHARACTER: Dialogue text without acting directions.

   (Voice Affect: Low, hushed, and suspenseful; Tone: Deeply serious and mysterious; 
   Pacing: Slow, deliberate; Emotion: Restrained yet intense; 
   Emphasis: On key words; Pronunciation: Slightly elongated vowels; 
   Pauses: Strategic pauses after important phrases)
   ```
5. Click "Import Formatted Script" to use the enhanced script in your story

### Audio Controls

- **Play Line**: Listen to a specific dialogue line
- **Play All**: Listen to the entire script sequentially
- **Regenerate**: Create fresh audio for a particular line that doesn't sound right
- **Export Line**: Download a single line as a WAV file
- **Export ZIP**: Download all lines as separate audio files in a ZIP archive
- **Export Single**: Combine all lines into a single audio file

### Story Management

- **Save**: Save your current story to local storage
- **New Story**: Create a new, blank story
- **Load Story**: Load a previously saved story

## Technical Details

- Built with Next.js, React, and TypeScript
- Uses OpenAI's GPT-4o-mini model for script formatting and enhancement
- Uses OpenAI's Text-to-Speech models for audio generation
- Responsive design with Tailwind CSS

## Limitations

- Requires an OpenAI API key
- Audio generation consumes OpenAI API credits
- Maximum script size is limited by OpenAI's API token limits

## Example Script Formatting

### Before formatting:

```
DETECTIVE: The footprints lead to the garden. (slowly, examining the ground) They stop right here.
GARDENER: (nervously) I was just pruning the roses this morning. Nothing unusual.
DETECTIVE: (suspiciously) The roses, you say? (pauses) The murder weapon was a pruning shear.
```

### After AI formatting:

```
DETECTIVE: The footprints lead to the garden. They stop right here.

(Voice Affect: Analytical and focused; Tone: Authoritative with underlying tension; Pacing: Methodical, slowing down at "right here"; Emotion: Intense concentration mixed with suspicion; Emphasis: On "footprints" and "stop"; Pronunciation: Crisp consonants; Pauses: Brief pause after "garden", longer pause before "They stop")

GARDENER: I was just pruning the roses this morning. Nothing unusual.

(Voice Affect: Anxious and defensive; Tone: Attempting casual but strained; Pacing: Slightly rushed, especially on "Nothing unusual"; Emotion: Nervousness masked with forced calm; Emphasis: Unnatural emphasis on "just" and "Nothing"; Pronunciation: Slight tremor in voice; Pauses: Quick intake of breath before speaking, minimal pauses)

DETECTIVE: The roses, you say? The murder weapon was a pruning shear.

(Voice Affect: Sharp and cutting; Tone: Deliberately provocative and accusatory; Pacing: Slow and measured for impact; Emotion: Controlled intensity building to revelation; Emphasis: Heavy emphasis on "roses" and "pruning shear"; Pronunciation: Elongated "s" in "roses"; Pauses: Significant pause after "you say?", dramatic pause before revealing the murder weapon)
```

## License

[APACHE-2.0 License](LICENSE)

## Acknowledgments

- Voice models and text formatting by OpenAI
- Icons from Heroicons

---

*Note: This project requires an OpenAI API key and will consume API credits when generating audio or formatting scripts.*
