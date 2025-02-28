import { Fragment, useState, useMemo, useEffect } from 'react'
import Modal from 'react-modal';
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
  getExpandedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { Product } from '../../dataModels/Product'
import { LoadingStatus, fetchInventory, selectInventoryProducts, refreshData } from './userInventorySlice'
import { useAppSelector, useAppDispatch } from '../../app/hooks'
import { selectAccessToken, selectClaims } from '../user/userSlice'
import ListingProductForm from './ListingProductForm';


function UserInventory() {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector(selectAccessToken);
  const claims = useAppSelector(selectClaims);
  const userInventoryProducts = useAppSelector(selectInventoryProducts);
  const userId = claims?.sub;
  const inventoryStatus = useAppSelector(state => state.userInventory.status)

  useEffect(() => {
    if (inventoryStatus === LoadingStatus.Idle && accessToken != null ) {
      dispatch(fetchInventory(userId))
    }
  }, [inventoryStatus, dispatch, userId, accessToken])

  const columns = useMemo<ColumnDef<Product>[]>(
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
      }
    ],
    []
  );

  const [sorting, setSorting] = useState<SortingState>([])

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable<Product>({
    columns,
    data: userInventoryProducts,
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

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
  };

  Modal.setAppElement('#root');
  const [modalIsOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product>();

  function openModal(product: Product) {
    setIsOpen(true);
    setSelectedProduct(product);
  }

  function afterOpenModal() {
  }

  function closeModal() {
    setIsOpen(false);
  }

  return (
    <div className="main">
      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
      >
        <ListingProductForm selectedProduct={selectedProduct} closeModal={closeModal} />
      </Modal>
    {accessToken ? ( 
      inventoryStatus == LoadingStatus.Loading ? (
        <>
          <h3>Loading...</h3>
        </>
      ) :
      (
      <>
      <div>{accessToken}</div>
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
                <tr onClick={() => openModal(row.original)} className='cursor-pointer tr-hover'>
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
      <button onClick={() => dispatch(refreshData())}>Refresh Data</button>
    </>
    )) : (
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
  column: Column<Product, unknown>;
  table: Table<Product>;
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

export default UserInventory;