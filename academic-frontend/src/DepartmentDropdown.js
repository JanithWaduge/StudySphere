// DepartmentDropdown.js
import { Listbox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

const departments = [
  { name: 'Select Department', value: '' },
  { name: 'Computing', value: 'Computing' },
  { name: 'Business', value: 'Business' },
  { name: 'Engineering', value: 'Engineering' },
];

export default function DepartmentDropdown({ value, onChange, error }) {
  const selectedDept = departments.find((d) => d.value === value) || departments[0];

  return (
    <div className="w-full">
      <Listbox value={selectedDept} onChange={(val) => onChange(val.value)}>
        <div className="relative mt-1">
          <Listbox.Button
            className={`relative w-full cursor-default rounded-lg bg-yellow-100 py-3 pl-4 pr-10 text-left shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 ${
              error ? 'border border-red-500' : 'border border-orange-300'
            }`}
          >
            <span className="block truncate text-orange-800 font-medium">{selectedDept.name}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronUpDownIcon className="h-5 w-5 text-orange-600" aria-hidden="true" />
            </span>
          </Listbox.Button>

          <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-orange-300 focus:outline-none sm:text-sm">
            {departments.map((dept, index) => (
              <Listbox.Option
                key={index}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-yellow-200 text-orange-800' : 'text-gray-900'
                  }`
                }
                value={dept}
              >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                      {dept.name}
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-orange-600">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
