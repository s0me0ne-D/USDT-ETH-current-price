import React, { useEffect, useState } from "react";
import "./exchange.scss";
import { SwapIcon } from "./assets/icons/SwapIcon";

interface ITradeData {
	E: number;
	T: number;
	X: string;
	e: string;
	m: boolean;
	p: string;
	q: string;
	s: string;
	t: number;
}
interface IValueType {
	type: "ETH" | "USDT";
	value: number;
}
const SRTEAM = "stream?streams=ethusdt@trade";
const wsChanel = new WebSocket(`wss://fstream.binance.com/${SRTEAM}`);

export const Exchange = () => {
	const [data, setData] = useState<ITradeData | null>(null);
	const [sale, setSale] = useState<IValueType>({ type: "ETH", value: 1 });
	const [buy, setBuy] = useState<IValueType>({ type: "USDT", value: 0 });
	const [flipInputFields, setFlipInputFields] = useState(false);
	useEffect(() => {
		if (data) {
			if (!flipInputFields) {
				setBuy((prev) => ({
					...prev,
					value: Math.floor(sale.value * Number(data?.p) * 100) / 100,
				}));
			} else if (flipInputFields) {
				setBuy((prev) => ({
					...prev,
					value: Math.floor((sale.value / Number(data.p)) * 100000000) / 100000000,
				}));
			}
		}
	}, [data, sale]);

	useEffect(() => {
		wsChanel.onmessage = function (event) {
			const json = JSON.parse(event.data);
			try {
				if ((json.event = "data")) {
					setData(json.data);
				}
			} catch (err) {
				console.log(err);
			}
		};
	}, []);
	const flipConversionInputFields = () => {
		if (flipInputFields) {
			setSale((prev) => ({ ...prev, type: "ETH" }));
			setBuy((prev) => ({ ...prev, type: "USDT" }));
		} else {
			setSale((prev) => ({ ...prev, type: "USDT" }));
			setBuy((prev) => ({ ...prev, type: "ETH" }));
		}
		setFlipInputFields((prev) => !prev);
	};
	return (
		<div className="exchange">
			<div className="exchange_block">
				<div className="exchange_block_title">
					<span>From</span>
					<span className="exchange_type">{sale.type}</span>
				</div>
				<input
					className="exchange_value"
					type="text"
					value={sale.value}
					onChange={(event) => setSale((prev) => ({ ...prev, value: +event.target.value }))}
				/>
			</div>
			<button className="exchange_flip" onClick={flipConversionInputFields}>
				<SwapIcon />
			</button>
			<div className="exchange_block">
				<div className="exchange_block_title">
					<span>To</span>
					<span className="exchange_type">{buy.type}</span>
				</div>

				<input className="exchange_value" type="text" value={buy.value} />
			</div>
			<div className="exchange_price">
				1 {sale.type} ={" "}
				{!flipInputFields ? data?.p : Math.floor((1 / Number(data?.p)) * 100000000) / 100000000}{" "}
				{buy.type}
			</div>
		</div>
	);
};
