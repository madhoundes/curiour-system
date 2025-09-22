"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Icon } from "@/components/ui/icon"

export default function TestDropdownPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Dropdown Hover Effects Test
          </h1>
          <p className="text-gray-600">
            Test the restored hover highlighting effects on dropdown components
          </p>
        </div>

        {/* Test Dropdown Menu */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Dropdown Menu Test</h2>
          <div className="flex gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Basic Dropdown</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Icon name="User" size={16} className="mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Icon name="Settings" size={16} className="mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Icon name="CreditCard" size={16} className="mr-2" />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <Icon name="LogOut" size={16} className="mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Checkbox Items</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                  Status Bar
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                  Activity Bar
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked>
                  Panel
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Radio Items</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value="bottom">
                  <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Test Select Component */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Select Component Test</h2>
          <div className="flex gap-4">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="next.js">Next.js</SelectItem>
                <SelectItem value="sveltekit">SvelteKit</SelectItem>
                <SelectItem value="nuxt.js">Nuxt.js</SelectItem>
                <SelectItem value="remix">Remix</SelectItem>
                <SelectItem value="astro">Astro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Test Command Component */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Command Component Test</h2>
          <div className="w-[300px]">
            <Command>
              <CommandInput placeholder="Search framework..." />
              <CommandList>
                <CommandEmpty>No framework found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem value="next.js">Next.js</CommandItem>
                  <CommandItem value="sveltekit">SvelteKit</CommandItem>
                  <CommandItem value="nuxt.js">Nuxt.js</CommandItem>
                  <CommandItem value="remix">Remix</CommandItem>
                  <CommandItem value="astro">Astro</CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            How to Test
          </h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Hover over any dropdown item to see the highlighting effect</li>
            <li>• The background should change to a subtle accent color</li>
            <li>• Smooth transitions should be visible (200ms duration)</li>
            <li>• Focus states should also work for keyboard navigation</li>
            <li>• All dropdown types (menu, select, command) should work</li>
          </ul>
        </div>

        {/* Status */}
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            ✅ Fixed Issues
          </h3>
          <ul className="text-green-800 space-y-1 text-sm">
            <li>• Added hover:bg-accent to all dropdown items</li>
            <li>• Added hover:text-accent-foreground for proper contrast</li>
            <li>• Added transition-all duration-200 ease-out for smooth animations</li>
            <li>• Fixed DropdownMenuItem, SelectItem, and CommandItem components</li>
            <li>• Enhanced CSS with premium transition variables</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
