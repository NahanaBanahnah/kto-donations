import { ThemeProvider, createTheme } from '@mui/material/styles'

import CssBaseline from '@mui/material/CssBaseline'

const darkTheme = createTheme({
	palette: {
		mode: 'dark',
		background: {
			default: '#282828',
		},
		primary: {
			main: '#DA9A62',
		},
		secondary: {
			main: '#32BCBC',
		},
	},
})

const App = ({ Component, pageProps }) => {
	return (
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<Component {...pageProps} />
		</ThemeProvider>
	)
}

export default App
