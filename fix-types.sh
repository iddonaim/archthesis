#!/bin/bash

# Fix Button.tsx
sed -i '' 's/import { ButtonHTMLAttributes }/import { type ButtonHTMLAttributes }/g' src/components/common/Button.tsx

# Fix ErrorBoundary.tsx
sed -i '' 's/import { Component, ReactNode }/import { Component, type ReactNode }/g' src/components/common/ErrorBoundary.tsx

# Fix Modal.tsx
sed -i '' 's/import { Fragment, ReactNode }/import { Fragment, type ReactNode }/g' src/components/common/Modal.tsx

# Fix Layout.tsx
sed -i '' 's/import { ReactNode }/import { type ReactNode }/g' src/components/layout/Layout.tsx

# Fix unused imports in CanvasEditor
sed -i '' 's/, Rect, Group//' src/components/editor/CanvasEditor.tsx

# Fix utils.ts
echo 'Creating types for utils.ts'
