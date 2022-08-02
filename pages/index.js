import React, { useEffect, useState } from 'react'
import { useTheme } from '@mui/material/styles'
import Head from 'next/head'
import {
	Slider,
	Box,
	Typography,
	Skeleton,
	CircularProgress,
} from '@mui/material'
import Image from 'next/image'
import FavoriteIcon from '@mui/icons-material/Favorite'
import axios from 'axios'
import ViewSource from '../src/components/ViewSource/ViewSource'
import styles from '../styles/index.module.scss'

const Index = () => {
	const [TOTAL, setTotal] = useState(null)
	const [IS_UPDATING, setUpdating] = useState(false)
	const [LOADING, setLoading] = useState('Loading...')
	const [TIME_OUT, setTimedOut] = useState(false)
	const [PERCENT, setPercent] = useState(0)
	const [loaded, setLoaded] = useState(false)

	let i = 0
	let delay = 2
	let updatingOpacity = 0
	if (IS_UPDATING) {
		updatingOpacity = 1
	}

	let donationClass = [styles.donationText]

	useEffect(() => {
		setLoaded(true)
	}, [])

	const marks = [
		{
			value: 0,
			label: '$0',
		},
		{
			value: 50,
			label: `$17,500 Payment Made!`,
		},
		{
			value: 100,
			label: '$35,000',
		},
	]

	const FETCH = async first => {
		if (!first) {
			setUpdating(true)
		}

		const END = `https://deep-index.moralis.io/api/v2/`
		const WALLET = `0xc4669a3804a5d817e5afaf2656f9743f8a3a4e59`
		const HEADERS = {
			headers: {
				'X-API-Key': process.env.NEXT_PUBLIC_MOR,
			},
		}

		try {
			const BNC = await axios.get(
				`${END}${WALLET}/erc20?chain=bsc`,
				HEADERS
			)

			const ERC = await axios.get(
				`https://deep-index.moralis.io/api/v2/0xc4669a3804a5d817e5afaf2656f9743f8a3a4e59/erc20?chain=eth`,
				HEADERS
			)
			const POLY = await axios.get(
				`https://deep-index.moralis.io/api/v2/0xc4669a3804a5d817e5afaf2656f9743f8a3a4e59/erc20?chain=polygon`,
				HEADERS
			)
			const BNC_BALANCE = await axios.get(
				`https://deep-index.moralis.io/api/v2/0xc4669a3804a5d817e5afaf2656f9743f8a3a4e59/balance?chain=bsc`,
				HEADERS
			)
			const ETH_BALANCE = await axios.get(
				`https://deep-index.moralis.io/api/v2/0xc4669a3804a5d817e5afaf2656f9743f8a3a4e59/balance?chain=eth`,
				HEADERS
			)
			const BNB_PRICE = await axios.get(
				'https://deep-index.moralis.io/api/v2/erc20/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c/price?chain=bsc',
				HEADERS
			)
			const ETH_PRICE = await axios.get(
				'https://deep-index.moralis.io/api/v2/erc20/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/price?chain=eth',
				HEADERS
			)

			let eth_usd =
				(ETH_PRICE.data.usdPrice * ETH_BALANCE.data.balance) / 10 ** 18

			let bnb_usd =
				(BNB_PRICE.data.usdPrice * BNC_BALANCE.data.balance) / 10 ** 18

			const BLACKLIST = [
				'0x949e0a0672299e6fcd6bec3bd1735d6647b20618',
				'0x7aa3a53360541283ffa9192972223b47a902dc0c',
			]
			let bncArray = BNC.data.map(v => ({ ...v, chain: 'bsc' }))

			bncArray = bncArray.filter(
				v => !BLACKLIST.includes(v.token_address)
			)

			let ercArray = ERC.data.map(v => ({ ...v, chain: 'eth' }))
			let polyArray = POLY.data.map(v => ({ ...v, chain: 'polygon' }))

			const TOKENS = [...ercArray, ...bncArray, ...polyArray]

			let total = 17000 + eth_usd + bnb_usd

			for (const item of TOKENS) {
				let tokens = item.balance

				let { data } = await axios.get(
					`https://deep-index.moralis.io/api/v2/erc20/${item.token_address}/price?chain=${item.chain}`,
					HEADERS
				)
				let decimal = item.decimals
				let divisor = 10 ** decimal
				let price = data.usdPrice / divisor
				let tokenTotal = tokens * price
				total = total + tokenTotal
			}

			let fullTotal = total

			let percent = fullTotal / 35000
			setPercent(percent * 100)
			setTotal(`$${fullTotal.toFixed(2)}`)
			setUpdating(false)
		} catch (e) {
			delay++
			if (delay >= 3) {
				setLoading('Hang In There')
			}

			if (delay <= 5) {
				setTimeout(() => {
					FETCH(true)
				}, delay * 1000)
				throw 'retrying'
			} else {
				setLoading(
					`Oops ... Something isn't right ... You should let Nahana know in the Discord`
				)
				setTimedOut(true)
				throw 'Timed Out'
				return false
			}
		}
	}

	useEffect(() => {
		let interval

		const INIT = async () => {
			await FETCH(true)

			interval = setInterval(() => {
				FETCH(false)
			}, 1 * 60 * 1000)
		}

		INIT()

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
					sx={{ typography: { xs: 'h5', sm: 'h4', lg: 'h3' } }}
					mt={4}
					mb={4}
				>
					KTO Listing Donations
				</Typography>

				{TOTAL ? (
					<>
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
					</>
				) : (
					<>
						<Typography variant="caption">{LOADING}</Typography>
						{!TIME_OUT && <Skeleton variant="text" width={320} />}
					</>
				)}

				<Box
					mt={4}
					sx={{
						alignSelf: 'start',
						display: 'flex',
						alignContent: 'center',
						opacity: updatingOpacity,
					}}
				>
					<CircularProgress size={16} />

					<Typography ml={1} variant="caption">
						Updating
					</Typography>
				</Box>

				<Typography variant="caption" mt={4}>
					Donation Wallet Address:
				</Typography>
				<Typography variant="body1" mb={4}>
					0xc4669a3804a5d817e5afaf2656f9743f8a3a4e59
				</Typography>
				<Image src="/img/qr.png" width="150" height="150" alt="logo" />
				<Typography variant="body1" mt={4}>
					Total auto updates every minute
					<br />
					Values are estimated and may differ slightly
				</Typography>
			</Box>

			<footer className={styles.footer}>
				Made With <FavoriteIcon className={styles.heart} /> By Nahana
			</footer>
		</>
	)
}

export default Index
