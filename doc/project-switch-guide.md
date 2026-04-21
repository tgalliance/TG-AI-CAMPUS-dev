# Multi-Project Management Guide

## Project Switching Workflow

### 1. Project #1: TG AI Campus
- **Workspace**: `TG-AI-CAMPUS-dev.code-workspace`
- **Location**: `c:\Users\USER\Desktop\work\aicampus\TG-AI-CAMPUS-dev`
- **Memory Tags**: `project_context`, `ai_education`, `web_platform`, `tg_ai_campus`
- **Context File**: `project-context.md`

### 2. Project #2: EIS System
- **Workspace**: `EIS-System.code-workspace`
- **Location**: `C:\Users\USER\Desktop\work\EIS\EIS-System`
- **Memory Tags**: `project_context`, `enterprise_system`, `dashboard`, `eis_system`
- **Context File**: `project-context.md`

### 2. When Starting a New Project:
1. Create separate workspace file: `[project-name].code-workspace`
2. Create project-specific memory with unique tags
3. Create project-context.md file
4. Use project-specific folder structure

### 3. Project Switching Commands:
- **Switch to TG AI Campus**: Open `TG-AI-CAMPUS-dev.code-workspace`
- **Switch to EIS System**: Open `EIS-System.code-workspace`
- **Check Current Context**: Refer to `project-context.md`
- **Search Related Memories**: Use project-specific tags

### 4. Conversation Separation:
- Always mention current project name in conversations
- Use project-specific terminology
- Reference project-context.md when needed

### 5. Memory Management:
- Each project has dedicated memory entries
- Tags prevent cross-contamination
- Use `create_memory` with project-specific CorpusNames

## Example Usage:
```
User: "TG AI Campus project - need to fix the login page"
AI: [Uses TG AI Campus memory and context]
```

```
User: "EIS System project - update the dashboard"
AI: [Uses EIS System memory and context]
```

```
User: "Switch to EIS System"
AI: [Loads EIS System workspace and memory]
```

```
User: "Switch to TG AI Campus"
AI: [Loads TG AI Campus workspace and memory]
```
