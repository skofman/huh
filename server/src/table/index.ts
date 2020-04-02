class Table {
  private players: {
    [p: string]: {
      strength: { type: any[]; value: number; kicker: any[] };
      dealer: boolean;
      hand: any[];
      posted: boolean;
    };
  };
  private bb: number;
  private pot: number;
  private deck: boolean[];
  private community: string[];
  private hand: number;

  constructor(player: string, bb: number) {
    this.players = {
      [player]: {
        dealer: true,
        hand: [],
        strength: {
          value: 0,
          type: [],
          kicker: []
        },
        posted: false
      }
    };
    this.bb = bb;
    this.pot = 0;
    this.deck = Array(52).fill(true);
    this.community = [];
    this.hand = 1;
  }

  deal = () => {
    console.log('deal');
  };
}

export default Table;
