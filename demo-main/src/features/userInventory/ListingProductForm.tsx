import type { FieldApi } from '@tanstack/react-form'
import { useForm } from '@tanstack/react-form'
import { Product } from '../../dataModels/Product'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FieldInfo({ field }: { field: FieldApi<{ productDescription: string; listingPrice: number; }, any, undefined, undefined, any> }) {
  return (
    <>
      {field.state.meta.touchedErrors ? (
        <em>{field.state.meta.touchedErrors}</em>
      ) : null}
      {field.state.meta.isValidating ? 'Validating...' : null}
    </>
  )
}

type ListingProductFormProp = {
  selectedProduct: Product | undefined
  closeModal: () => void
};

export default function ListingProductForm(props: ListingProductFormProp) {
  const form = useForm({
    defaultValues: {
      productDescription: '',
      listingPrice: 0,
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value)
    },
  })

  return (
    <div>
      <h3>Sell your product</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <div>
          <label>Product Name:</label>
          <input readOnly={true} value={props.selectedProduct?.name} />
        </div>
        <div>
          {/* A type-safe field component*/}
          <form.Field
            name="productDescription"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? 'A product description is required'
                  : value.length > 150
                    ? 'Description must be at less than 150 characters'
                    : undefined
            }}
            children={(field) => {
              // Avoid hasty abstractions. Render props are great!
              return (
                <>
                  <label htmlFor={field.name}>Product Description:</label>
                  <textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldInfo field={field} />
                </>
              )
            }}
          />
        </div>
        <div>
          <form.Field
            name="listingPrice"
            children={(field) => (
              <>
                <label htmlFor={field.name}>Listing Price:</label>
                <input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  type="number"
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <>
              <button type="submit" disabled={!canSubmit}>
                {isSubmitting ? '...' : 'Submit'}
              </button>
            </>
          )}
        />
        <button onClick= {props.closeModal}>
          Close
        </button>
      </form>
    </div>
  )
}