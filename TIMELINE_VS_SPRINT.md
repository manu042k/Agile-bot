# Timeline vs Sprint: Naming and Implementation Guide

## Current Implementation

Currently, we use **"Timeline"** which shows the overall project schedule with all tasks.

## Industry Standards

### **Timeline** (Current)
- **Definition**: Overall project schedule showing all tasks from start to finish
- **Use Case**: Traditional project management, waterfall, hybrid approaches
- **Examples**: Asana, Monday.com, Microsoft Project
- **Timeframe**: Entire project duration (weeks to months)

### **Sprint** (Alternative)
- **Definition**: Time-boxed iteration in Agile (typically 1-4 weeks)
- **Use Case**: Scrum, Agile methodologies
- **Examples**: Jira (Sprint view), Azure DevOps, Linear
- **Timeframe**: Short iterations (1-4 weeks)

## Recommendation

### Option 1: Keep "Timeline" (Recommended for now)
**Pros:**
- ✅ Works for all project types (not just Agile)
- ✅ More generic and understandable
- ✅ Matches current FileUpload model which has both `timeline` and `sprintsize` fields
- ✅ Better for long-term projects

**Cons:**
- ❌ Less specific for Agile teams

### Option 2: Rename to "Sprint"
**Pros:**
- ✅ More aligned with Agile terminology
- ✅ FileUpload model already has `sprintsize` field
- ✅ Familiar to Scrum teams

**Cons:**
- ❌ Doesn't work for non-Agile projects
- ❌ Confusing for traditional project management
- ❌ Current implementation shows entire project, not just one sprint

### Option 3: Support Both (Best Long-term)
**Pros:**
- ✅ Best of both worlds
- ✅ Flexible for different project types
- ✅ Can have "Project Timeline" and "Sprint View"

**Implementation:**
- Keep "Timeline" for overall project view
- Add "Sprint" view that filters tasks by sprint/iteration
- Add sprint model/field to tasks

## Current Timeline End Date Logic

### How We Calculate (Improved):
1. **Start Date**: Project creation date or earliest task (whichever is earlier)
2. **End Date** (Priority order):
   - Latest completed task date (most reliable)
   - Latest task updated_at (shows activity)
   - Current date (for active projects)
   - +10% buffer or minimum 7 days for visualization

### How Other Boards Do It:

**Jira:**
- Project end date (if set) → Latest task completion → Current date

**Trello:**
- Latest card due date → Current date

**Asana:**
- Project end date → Latest task date → Current date

**Monday.com:**
- Project deadline → Milestone dates → Task dates

## Future Enhancements

1. **Add Project End Date Field**
   ```python
   end_date = models.DateTimeField(null=True, blank=True)
   ```

2. **Add Sprint Support**
   - Create Sprint model
   - Link tasks to sprints
   - Add sprint filter to timeline view

3. **Add Task Due Dates**
   - Use due dates for better timeline accuracy
   - Show overdue tasks differently

## Decision

**Recommendation: Keep "Timeline" for now, add "Sprint" view later**

- Current implementation shows entire project (not sprint-specific)
- More inclusive for different project management styles
- Can add sprint functionality as a separate feature later

