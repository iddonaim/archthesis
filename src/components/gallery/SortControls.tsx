import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ArrowUpDown, Check } from 'lucide-react'

export type SortOption = 'recent' | 'popular' | 'oldest'

interface SortOptionItem {
  value: SortOption
  label: string
}

const sortOptions: SortOptionItem[] = [
  { value: 'recent', label: 'חדשים ביותר' },
  { value: 'popular', label: 'פופולריים ביותר' },
  { value: 'oldest', label: 'ישנים ביותר' }
]

interface SortControlsProps {
  currentSort: SortOption
  onSortChange: (sort: SortOption) => void
}

export default function SortControls({
  currentSort,
  onSortChange
}: SortControlsProps) {
  const selectedOption = sortOptions.find((opt) => opt.value === currentSort)

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-gray-700">מיון:</span>

      <Listbox value={currentSort} onChange={onSortChange}>
        <div className="relative">
          <Listbox.Button className="relative w-48 cursor-pointer rounded-lg bg-white py-2 pl-10 pr-3 text-right shadow-md hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/50">
            <span className="block truncate font-medium">
              {selectedOption?.label}
            </span>
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <ArrowUpDown size={16} className="text-gray-400" />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
              {sortOptions.map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option.value}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 transition-colors ${
                      active ? 'bg-primary/10 text-primary' : 'text-gray-900'
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-semibold' : 'font-normal'
                        }`}
                      >
                        {option.label}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                          <Check size={16} />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  )
}
