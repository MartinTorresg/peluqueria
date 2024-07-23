import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

const ListaProductos = ({
  open,
  handleClose,
  handleDialogEntered,
  inputRef,
  handleSearch,
  handleKeyDown,
  products,
  search,
  handleSelectProduct
}) => {
  return (
    <Dialog
      onClose={handleClose}
      open={open}
      maxWidth="md"
      fullWidth={true}
      onEntered={handleDialogEntered}
    >
      <div className="p-4">
        <div className="flex items-center relative">
          <SearchIcon className="absolute left-3 text-gray-500 z-10" />
          <input
            ref={inputRef}
            type="text"
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            placeholder="Nombre del producto o código de barras"
            className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <DialogContent className="max-w-[900px] max-h-[500px] overflow-auto">
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className="text-sm font-medium">Nombre del Producto</TableCell>
                <TableCell className="text-sm font-medium">Código de Barras</TableCell>
                <TableCell className="text-sm font-medium">Precio</TableCell>
                <TableCell className="text-sm font-medium">Seleccionar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products
                .filter(
                  (product) =>
                    search === '' ||
                    product.name?.toLowerCase().includes(search.toLowerCase()) ||
                    product.barcode?.includes(search)
                )
                .slice(0, 100)
                .map((product, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-4 py-2">{product.name}</TableCell>
                    <TableCell className="px-4 py-2">{product.barcode}</TableCell>
                    <TableCell className="px-4 py-2">{product.price}$</TableCell>
                    <TableCell className="px-4 py-2">
                      <button
                        className="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 focus:outline-none"
                        onClick={() => handleSelectProduct(product)}
                      >
                        Seleccionar
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <button
          onClick={handleClose}
          className="bg-red-700 text-white py-2 px-4 rounded hover:bg-blue-800 focus:outline-none"
        >
          Cerrar
        </button>
      </DialogActions>
    </Dialog>
  )
}

export default ListaProductos
