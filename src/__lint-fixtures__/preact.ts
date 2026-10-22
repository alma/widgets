// expect: no-restricted-imports "The bundle has no React"
import { h } from 'preact'
import { useState } from 'preact/hooks'

export const parts = [h, useState]
