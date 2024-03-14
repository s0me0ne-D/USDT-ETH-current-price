import React, { useCallback, useEffect, useState } from "react";
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
const STREAM = "stream?streams=ethusdt@trade";
const wsChanel = new WebSocket(`wss://fstream.binance.com/${STREAM}`);

export const Exchange = () => {
	const [data, setData] = useState<ITradeData | null>(null);
	const [sale, setSale] = useState<IValueType>({ type: "ETH", value: 1 });
	const [buy, setBuy] = useState<IValueType>({ type: "USDT", value: 0 });
	const [flipInputFields, setFlipInputFields] = useState(false);
	const calculateValue = useCallback(
		(value: number, rate: number, precision: number) =>
			Math.floor(value * rate * precision) / precision,
		[]
	);

	useEffect(() => {
		if (data) {
			const rate = Number(data.p);
			const value = flipInputFields
				? calculateValue(sale.value / rate, 1, 100000000)
				: calculateValue(sale.value, rate, 100);
			setBuy((prev) => ({ ...prev, value }));
		}
	}, [data, sale, flipInputFields, calculateValue]);

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
		setSale((prev) => ({ ...prev, type: flipInputFields ? "ETH" : "USDT" }));
		setBuy((prev) => ({ ...prev, type: flipInputFields ? "USDT" : "ETH" }));
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
					type="number"
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

				<input className="exchange_value" type="number" value={buy.value} />
			</div>
			<div className="exchange_price">
				1 {sale.type} ={" "}
				{!flipInputFields ? data?.p : Math.floor((1 / Number(data?.p)) * 100000000) / 100000000}{" "}
				{buy.type}
			</div>
		</div>
	);
};
