import './ProductTable.css'
import { Fragment, useState, useMemo, useEffect } from 'react'
import {
  Column,
  ColumnDef,
  PaginationState,
  Table,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
  getExpandedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { ListingProduct } from '../dataModels/ListingProduct'
import { getListingProducts } from '../api/GetListingProductsAPI'
import { useAppSelector } from '../app/hooks'
import { selectAccessToken } from '../features/user/userSlice'
import Modal from 'react-modal';
import { purchaseProduct } from '../api/PurchaseProductsAPI'


function ProductTable() {
  const accessToken = useAppSelector(selectAccessToken);

  const columns = useMemo<ColumnDef<ListingProduct>[]>(
    () => [
      {
        accessorKey: 'name',
        header: () => 'Product Name',
        enableSorting: false
      },
      {
        accessorKey: 'category',
        header: () => 'Category',
        enableSorting: false
      },
      {
        accessorKey: 'price',
        header: () => 'Price',
        sortUndefined: 'last', //force undefined values to the end
        sortDescFirst: false,
        enableColumnFilter: false
      },
      {
        accessorKey: 'seller.displayName',
        header: () => 'Seller',
        enableSorting: false
      },
    ],
    []
  );

  const [data, setData] = useState<ListingProduct[]>([]);
  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  Modal.setAppElement('#root');

  async function fetchListingProducts() {
    const response = await getListingProducts();
    setData(response.data);
  }

  useEffect(() => {
    if (accessToken != null) {
      fetchListingProducts();
    }
  }, [accessToken]);

  const [sorting, setSorting] = useState<SortingState>([])

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    columns,
    data,
    debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    //no need to pass pageCount or rowCount with client-side pagination as it is calculated automatically
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    state: {
      sorting,
      pagination,
    },
    // autoResetPageIndex: false, // turn off page index reset when sorting or filtering
  });

  function buyProduct(productId : number)
  {
    console.log(productId);
    purchaseProduct(productId).then(fetchListingProducts).finally(() => setProcessing(false));
    setOpen(!open);
    setProcessing(true);
  }

  const renderSubComponent = ({ row }: { row: Row<ListingProduct> }) => {
    return (
      <div className={"productDetails " + (row.getIsExpanded() ? 'tb-expand' : '')}>
        <p>{row.original.description}</p> 
        <div style={{textAlign:'right'}}>
          <button onClick={() => setOpen(!open)} className='buyBtn'>Buy Now</button>
          <Modal
            isOpen={open}
            contentLabel="Confirm"
            className="modal"
          >
            <p style={{color:'white'}}>Confirm to buy "{row.original.name}"?</p>
            <button onClick={() => buyProduct(row.original.id)}>Confirm</button>
            <button onClick={() => setOpen(!open)}>Cancel</button>
          </Modal>
          <Modal
            isOpen={processing}
            contentLabel="Processing"
            className="modal"
          >
            <p style={{ color: 'white' }}>Process your purchase order, please wait...</p>
          </Modal>
        </div>
      </div>
    )
  }

  return (
    <div className="main">
    {accessToken ? (
      <>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th key={header.id}>
                    <div
                      {...{
                        className: header.column.getCanSort()
                          ? 'cursor-pointer select-none'
                          : '',
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted() as string] ?? null}
                      {header.column.getCanFilter() ? (
                        <div>
                          <Filter column={header.column} table={table} />
                        </div>
                      ) : null}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            return (
              <Fragment key={row.id}>
                <tr onClick={row.getToggleExpandedHandler()} className='cursor-pointer tr-hover'>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  )
                })}
              </tr>
              <tr>
                <td colSpan={row.getVisibleCells().length}>
                {renderSubComponent({row})}
                </td>
              </tr>
              </Fragment>
            )
          })}
        </tbody>
      </table>
      <div className="flex items-center">
        <button
          className="border rounded p-1"
          onClick={() => table.firstPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.lastPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount().toLocaleString()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="border p-1 rounded w-16"
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      <div>
        Showing {table.getRowModel().rows.length.toLocaleString()} of{' '}
        {table.getRowCount().toLocaleString()} Rows
      </div>
      <pre>{JSON.stringify(table.getState().pagination, null, 2)}</pre>
    </>
    ) : (
    <>
      <h1>Please login first.</h1>
    </>
    )}
    </div>
  );
}

function Filter({
  column,
  table,
}: {
  column: Column<ListingProduct, unknown>;
  table: Table<ListingProduct>;
}) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  return typeof firstValue === 'number' ? (
    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
      <input
        type="number"
        value={(columnFilterValue as [number, number])?.[0] ?? ''}
        onChange={(e) =>
          column.setFilterValue((old: [number, number]) => [
            e.target.value,
            old?.[1],
          ])
        }
        placeholder={`Min`}
        className="w-24 border shadow rounded"
      />
      <input
        type="number"
        value={(columnFilterValue as [number, number])?.[1] ?? ''}
        onChange={(e) =>
          column.setFilterValue((old: [number, number]) => [
            old?.[0],
            e.target.value,
          ])
        }
        placeholder={`Max`}
        className="w-24 border shadow rounded"
      />
    </div>
  ) : (
    <input
      className="w-36 border shadow rounded"
      onChange={(e) => column.setFilterValue(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      placeholder={`Search...`}
      type="text"
      value={(columnFilterValue ?? '') as string}
    />
  );
}  

export default ProductTable;