import { forwardRef, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import DatePicker from "react-datepicker";
import { useAccount, useSigner } from "wagmi";
import { ethers } from "ethers";
import { Logger } from "@ethersproject/logger";
import { PrimaryButton, SecondaryButton, TitleH2 } from "../../../components/basic";
import { getProduct, getUserListedItem } from "../../../service";
import { IProduct, MarketplaceItemFullType } from "../../../types";
import { getMarketplaceInstance, getNFTInstance } from "../../../utils/contract";
import ProductABI from "../../../constants/abis/SHProduct.json";
import { USDC_ADDRESS } from "../../../constants/address";
import "react-datepicker/dist/react-datepicker.css";
import useToast from "../../../hooks/useToast";

const PortfolioCreatePage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const { data: signer } = useSigner();
  const { address } = useAccount();
  const { id: listingId } = router.query;

  const [item, setItem] = useState<MarketplaceItemFullType>();
  const [, setIsLoading] = useState(false);
  const [maxBalance, setMaxBalance] = useState(0);
  const [product, setProduct] = useState<IProduct | undefined>(undefined);
  const [marketplaceInstance, setMarketplaceInstance] = useState<ethers.Contract>();
  const [txPending, setTxPending] = useState(false);
  const [nftInstance, setNFTInstance] = useState<ethers.Contract>();
  const [lots, setLots] = useState(1);
  const [price, setPrice] = useState(0);
  const [startingTime, setStartingTime] = useState<Date>(new Date());

  // eslint-disable-next-line react/display-name,@typescript-eslint/no-unused-vars
  const CustomInput = forwardRef(({ value, onClick }: { value?: string; onClick?: () => void }, ref) => (
    <div className={"relative flex items-center"}>
      <div className={"w-full py-3 px-4 bg-[#FBFBFB] border border-[1px] border-[#E6E6E6] rounded focus:outline-none"} onClick={onClick}>
        {value}
      </div>
      <span className={"absolute right-4 text-[#828A93]"}>
        <Image src={"/icons/calendar.svg"} alt={"calendar"} width={20} height={20} />
      </span>
    </div>
  ));

  const productAddress = item?.productAddress;

  const productInstance = useMemo(() => {
    if (signer && productAddress) return new ethers.Contract(productAddress as string, ProductABI, signer);
    else return null;
  }, [signer, productAddress]);

  const onUpdateNFT = async () => {
    if (product && product.status !== 3) {
      return showToast("Your product is not issued yet. Please wait until issuance date to list your NFT.", "error");
    }
    if (address && signer && marketplaceInstance && nftInstance && product) {
      try {
        setTxPending(true);
        const updateTx = await marketplaceInstance.updateListing(listingId, USDC_ADDRESS, ethers.utils.parseUnits(price.toString(), 6));
        await updateTx.wait();
        showToast("NFT CHANGES SUCCESSFULLY SAVED");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (e && e.code && e.code === Logger.errors.ACTION_REJECTED) {
          return showToast("Transaction rejected", "error");
        } else {
          return showToast(e.error.message, "error");
        }
      } finally {
        setTxPending(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      setIsLoading(true);
      getProduct(productAddress as string)
        .then((product) => {
          setProduct(product);
        })
        .finally(() => setIsLoading(false));
    };
  }, [productAddress]);

  useEffect(() => {
    (async () => {
      if (productInstance && nftInstance && address) {
        const currentTokenId = await productInstance.currentTokenId();
        const maxBalance = await nftInstance.balanceOf(address, currentTokenId);
        setMaxBalance(maxBalance.toNumber());
      }
    })();
  }, [productInstance, nftInstance, address]);

  useEffect(() => {
    (async () => {
      if (signer) {
        setMarketplaceInstance(getMarketplaceInstance(signer));
        setNFTInstance(getNFTInstance(signer));
      }
    })();
  }, [signer]);

  useEffect(() => {
    (async () => {
      const _item = await getUserListedItem(listingId as string);
      if (_item) {
        setItem(_item);
        setPrice(_item.offerPrice);
        setStartingTime(new Date(_item.startingTime * 1000));
      }
    })();
  }, [listingId]);

  return (
    <div className={"py-[80px] flex justify-center"}>
      <div className={"max-w-[650px] w-full"}>
        <div className={"flex flex-col items-center w-full"}>
          <div className={"w-full bg-black rounded-[16px]"}>
            <div className={"pl-10 h-[150px] flex items-center pt-5"}>
              <TitleH2 className={"text-white"}>Edit NFT</TitleH2>
            </div>
            <img
              src={item ? item.issuanceCycle.image_uri || "/products/default_nft_image.png" : "/products/default_nft_image.png"}
              width={"100%"}
              alt={""}
            />
          </div>

          <div className={"w-full flex flex-col space-y-6 bg-white rounded-[16px] p-12 mt-5"}>
            <div className={"flex flex-col space-y-2"}>
              <div className={"text-[#494D51] text-[16px]"}>Product lots</div>

              <div className={"relative flex items-center"}>
                <input
                  className={"w-full py-3 px-4 bg-[#FBFBFB] border border-[1px] border-[#E6E6E6] rounded focus:outline-none"}
                  value={lots}
                  onChange={(e) => setLots(Number(e.target.value))}
                  type='text'
                />
                <div className={"absolute right-4 flex items-center space-x-[10px]"}>
                  <span
                    className={
                      "bg-grey-20 flex items-center justify-center px-3 h-[28px] w-[140px] rounded-[6px] text-[12px] leading-[12px] cursor-pointer"
                    }
                    onClick={() => setLots(1)}
                  >
                    MIN
                  </span>
                  <span
                    className={
                      "bg-grey-20 flex items-center justify-center px-3 h-[28px] w-[140px] rounded-[6px] text-[12px] leading-[12px] cursor-pointer"
                    }
                    onClick={() => setLots(maxBalance)}
                  >
                    MAX
                  </span>
                </div>
              </div>
            </div>
            <div className={"flex flex-col space-y-2"}>
              <div className={"text-[#494D51] text-[16px]"}>NFT Price (USDC)</div>

              <div className={"relative flex items-center"}>
                <input
                  className={"w-full py-3 px-4 bg-[#FBFBFB] border border-[1px] border-[#E6E6E6] rounded focus:outline-none"}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  type='text'
                />
                {/*<span className={"absolute right-4 text-[#828A93]"}>Lots</span>*/}
              </div>

              <div
                className={"rounded-[6px] bg-warning h-[32px] flex items-center justify-center px-3 text-[12px] leading-[12px] text-white"}
                style={{ inlineSize: "fit-content" }}
              >
                Market Price - 10,500 USDC - 10 Lots
              </div>
            </div>
            <div className={"flex flex-col space-y-2"}>
              <div className={"text-[#494D51] text-[16px]"}>Offer Start Since (GTC)</div>

              <div className={"relative flex items-center"}>
                <DatePicker
                  selected={startingTime}
                  showPopperArrow={false}
                  filterDate={(date: Date) => date.getTime() > Date.now()}
                  onChange={(date: Date) => setStartingTime(date)}
                  disabled={true}
                  customInput={<CustomInput />}
                />
              </div>
            </div>

            <div className={"flex items-center space-x-6"}>
              <SecondaryButton label={"CANCEL"} onClick={() => router.push(`/portfolio/position/${product?.address}`)} />
              <PrimaryButton
                label={"SAVE"}
                disabled={!signer || !product || txPending || product.status !== 3}
                loading={txPending}
                className={"flex items-center justify-center"}
                onClick={onUpdateNFT}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCreatePage;