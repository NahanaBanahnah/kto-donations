import React, { useEffect, useState } from 'react'
import { useTheme } from '@mui/material/styles'
import Head from 'next/head'
import { Slider, Box, Typography } from '@mui/material'
import Image from 'next/image'
import FavoriteIcon from '@mui/icons-material/Favorite'
import axios from 'axios'
import ViewSource from '../src/components/ViewSource/ViewSource'
import styles from '../styles/index.module.scss'

const Index = () => {
	const [TOTAL, setTotal] = useState()
	const [PERCENT, setPercent] = useState(0)

	const marks = [
		{
			value: 0,
			label: '$0',
		},
		{
			value: 50,
			label: '$17,500',
		},
		{
			value: 100,
			label: '$35,000',
		},
	]

	const FETCH = async () => {
		const BALANCE = await axios.get(
			`https://api.ethplorer.io/getAddressInfo/0xc4669a3804a5d817e5afaf2656f9743f8a3a4e59?apiKey=${process.env.NEXT_PUBLIC_API}`
		)

		let ETH = BALANCE.data.ETH.balance * BALANCE.data.ETH.price.rate
		let total = 0

		for (const item of BALANCE.data.tokens) {
			let tokens = item.rawBalance
			let price = item.tokenInfo.price.rate
			let decimal = item.tokenInfo.decimals
			let divisor = 10 ** decimal
			let tokenTotal = (tokens * price) / divisor
			total = total + tokenTotal
		}
		let fullTotal = ETH + total
		let percent = fullTotal / 35000

		setPercent(percent * 100)
		setTotal(`$${fullTotal.toFixed(2)}`)
	}

	useEffect(() => {
		FETCH()
		let interval = setInterval(FETCH, 1 * 60 * 1000)
		return () => {
			clearInterval(interval) //This is important
		}
	}, [])

	return (
		<>
			<Head>
				<title>KTO Listing Donations</title>
			</Head>
			<ViewSource />

			<Box
				sx={{
					margin: `0 auto`,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					width: { xs: 340, sm: 576, md: 768, lg: 1200, xl: 1400 },
				}}
				pt={4}
			>
				<Image src="/img/logo.png" width="600" height="91" alt="logo" />

				<Typography
					sx={{ typography: { xs: 'h5', sm: 'h4', lg: 'h2' } }}
					mt={4}
					mb={4}
				>
					KTO Listing Donations
				</Typography>
				<Slider
					defaultValue={0}
					value={PERCENT}
					aria-label="Always visible"
					valueLabelFormat={TOTAL}
					step={10}
					marks={marks}
					valueLabelDisplay="on"
					color="secondary"
				/>
			</Box>

			<footer className={styles.footer}>
				Made With <FavoriteIcon className={styles.heart} /> By Nahana
			</footer>
		</>
	)
}

export default Index
